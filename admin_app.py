import hashlib
import hmac
import os
import sqlite3
import sys
import time
from datetime import datetime
from pathlib import Path

from PySide6.QtCore import Qt, QTimer 
from PySide6.QtWidgets import (  
    QAbstractItemView,
    QApplication,
    QBoxLayout,
    QFrame,
    QHeaderView,
    QLabel,
    QLineEdit,
    QMainWindow,
    QMessageBox,
    QPushButton,
    QTableWidget,
    QTableWidgetItem,
    QVBoxLayout,
    QHBoxLayout,
    QWidget,
)

import database


DATABASE_PATH = database.DATABASE_PATH
REFRESH_INTERVAL_MS = 30_000
DEFAULT_ADMIN_PASSWORD = "Folking123"
ADMIN_PASSWORD_SALT = bytes.fromhex("8d5f5a6c1b2e9f304a7c6d8e9f102938")
MIN_ADMIN_PASSWORD_LENGTH = 10
ADMIN_SCRYPT_MAXMEM = 64 * 1024 * 1024
GAME_STAGES = {
    0: "Загадка 1",
    1: "Загадка 2",
    2: "Выбор подозреваемого"
}


def fetch_users(database_path: Path = DATABASE_PATH) -> list[dict]:
    database_uri = f"{database_path.resolve().as_uri()}?mode=ro"
    connection = sqlite3.connect(database_uri, uri=True, timeout=5)
    try:
        connection.row_factory = sqlite3.Row
        rows = connection.execute(
            """
            SELECT users.id, users.username, users.email, users.english_level,
                   users.created_at, users.last_active_at,
                   users.banned_until, users.ban_reason,
                   game_progress.stage, game_progress.completed
            FROM users
            LEFT JOIN game_progress ON game_progress.user_id = users.id
            ORDER BY users.created_at DESC
            """
        ).fetchall()
        return [dict(row) for row in rows]
    finally:
        connection.close()


def update_user_ban(user_id: int, banned: bool, reason: str = "") -> None:
    connection = sqlite3.connect(DATABASE_PATH, timeout=5)
    try:
        banned_until = int(time.time()) + 60 * 60 * 24 * 365 * 100 if banned else 0
        connection.execute(
            "UPDATE users SET banned_until = ?, ban_reason = ? WHERE id = ?",
            (banned_until, reason[:200] if banned else "", user_id),
        )
        if banned:
            connection.execute("DELETE FROM sessions WHERE user_id = ?", (user_id,))
        connection.commit()
    finally:
        connection.close()


def reset_user_progress(user_id: int) -> None:
    connection = sqlite3.connect(DATABASE_PATH, timeout=5)
    try:
        connection.execute(
            "UPDATE game_progress SET stage = 0, clues_json = '[]', completed = 0 WHERE user_id = ?",
            (user_id,),
        )
        connection.commit()
    finally:
        connection.close()


def delete_user(user_id: int, database_path: Path = DATABASE_PATH) -> None:
    """Delete the account and all data linked to it in one transaction."""
    with database.connect(database_path) as connection:
        connection.execute("DELETE FROM sessions WHERE user_id = ?", (user_id,))
        connection.execute("DELETE FROM game_progress WHERE user_id = ?", (user_id,))
        connection.execute("DELETE FROM users WHERE id = ?", (user_id,))


def password_digest(password: str) -> bytes:
    return hashlib.scrypt(
        password.encode("utf-8"), salt=ADMIN_PASSWORD_SALT,
        n=32_768, r=8, p=1, dklen=64, maxmem=ADMIN_SCRYPT_MAXMEM,
    )


class UserMonitorApp(QMainWindow):
    def __init__(self) -> None:
        super().__init__()
        self.admin_password = os.environ.get("GAME_ADMIN_PASSWORD", DEFAULT_ADMIN_PASSWORD)
        self.admin_password_hash = password_digest(self.admin_password)
        self.failed_attempts = 0
        self.users: list[dict] = []
        self.search_input: QLineEdit | None = None
        self.table: QTableWidget | None = None
        self.status_label: QLabel | None = None

        self.setWindowTitle("База пользователей — Последний звонок")
        self.resize(1120, 640)
        self.setMinimumSize(820, 460)
        self.configure_theme()

        self.refresh_timer = QTimer(self)
        self.refresh_timer.setInterval(REFRESH_INTERVAL_MS)
        self.refresh_timer.timeout.connect(self.auto_refresh)

        if len(self.admin_password) < MIN_ADMIN_PASSWORD_LENGTH:
            self.show_password_setup()
        else:
            self.show_login()

    def configure_theme(self) -> None:
        self.setStyleSheet(
            """
            QMainWindow, QWidget {
                background: #080d0a;
                color: #d8f3df;
                font-family: "Segoe UI";
                font-size: 10pt;
            }
            QFrame#panel {
                background: #101914;
                border: 1px solid #244331;
                border-radius: 12px;
            }
            QLabel#eyebrow {
                color: #63ff91;
                font-family: Consolas;
                font-size: 9pt;
                font-weight: 700;
            }
            QLabel#title {
                color: #63ff91;
                font-size: 20pt;
                font-weight: 700;
            }
            QLabel#muted {
                color: #83a58d;
            }
            QLabel#status {
                color: #63ff91;
                font-family: Consolas;
            }
            QLineEdit {
                background: #0b120e;
                color: #d8f3df;
                border: 1px solid #244331;
                border-radius: 6px;
                padding: 10px 12px;
                selection-background-color: #1b5630;
            }
            QLineEdit:focus {
                border: 1px solid #63ff91;
            }
            QPushButton {
                background: #14251a;
                color: #63ff91;
                border: 1px solid #315c3d;
                border-radius: 6px;
                padding: 10px 16px;
                font-weight: 700;
            }
            QPushButton:hover {
                background: #1b5630;
                color: #a0ffb8;
            }
            QPushButton:pressed {
                background: #244331;
            }
            QTableWidget {
                background: #0b120e;
                alternate-background-color: #101914;
                color: #d8f3df;
                border: 1px solid #244331;
                border-radius: 6px;
                gridline-color: #1b2b20;
                selection-background-color: #1b5630;
                selection-color: #a0ffb8;
            }
            QHeaderView::section {
                background: #14251a;
                color: #63ff91;
                border: 0;
                border-bottom: 1px solid #315c3d;
                padding: 10px 8px;
                font-weight: 700;
            }
            QScrollBar:vertical {
                background: #0b120e;
                width: 12px;
                margin: 0;
            }
            QScrollBar::handle:vertical {
                background: #315c3d;
                border-radius: 5px;
                min-height: 24px;
            }
            QScrollBar:horizontal {
                background: #0b120e;
                height: 12px;
                margin: 0;
            }
            QScrollBar::handle:horizontal {
                background: #315c3d;
                border-radius: 5px;
                min-width: 24px;
            }
            QScrollBar::add-line, QScrollBar::sub-line {
                width: 0;
                height: 0;
            }
            QMessageBox {
                background: #101914;
            }
            """
        )

    def set_page(self, page: QWidget) -> None:
        previous_page = self.takeCentralWidget()
        if previous_page is not None:
            previous_page.deleteLater()
        self.setCentralWidget(page)

    def show_password_setup(self) -> None:
        page = QWidget()
        page_layout = QVBoxLayout(page)
        page_layout.setContentsMargins(36, 36, 36, 36)
        page_layout.addStretch()

        card = QFrame()
        card.setObjectName("panel")
        card.setMaximumWidth(620)
        card_layout = QVBoxLayout(card)
        card_layout.setContentsMargins(32, 30, 32, 30)
        card_layout.setSpacing(14)
        self.add_label(card_layout, "ACCESS CONFIGURATION", "eyebrow")
        self.add_label(card_layout, "Задай пароль администратора", "title")
        self.add_label(
            card_layout,
            "Нужно не менее 16 символов.\n"
            "В PowerShell задай пароль и запусти приложение:\n\n"
            '$env:GAME_ADMIN_PASSWORD = "твой-длинный-пароль"\n'
            "python admin_app.py\n\n"
            "Не записывай пароль в файлы проекта и никому его не отправляй.",
            "muted",
        )
        page_layout.addWidget(card, alignment=Qt.AlignmentFlag.AlignHCenter)
        page_layout.addStretch()
        self.set_page(page)

    def show_login(self) -> None:
        page = QWidget()
        page_layout = QVBoxLayout(page)
        page_layout.setContentsMargins(36, 36, 36, 36)
        page_layout.addStretch()

        card = QFrame()
        card.setObjectName("panel")
        card.setMaximumWidth(520)
        card_layout = QVBoxLayout(card)
        card_layout.setContentsMargins(32, 30, 32, 30)
        card_layout.setSpacing(14)
        self.add_label(card_layout, "SECURE ACCESS // 01", "eyebrow")
        self.add_label(card_layout, "Вход администратора", "title")
        self.add_label(
            card_layout, "Пароли пользователей здесь не отображаются.", "muted"
        )

        self.password_input = QLineEdit()
        self.password_input.setEchoMode(QLineEdit.EchoMode.Password)
        self.password_input.setPlaceholderText("Пароль администратора")
        self.password_input.returnPressed.connect(
            lambda: self.verify_password(self.password_input.text())
        )
        card_layout.addWidget(self.password_input)

        login_button = QPushButton("ВОЙТИ")
        login_button.clicked.connect(
            lambda: self.verify_password(self.password_input.text())
        )
        card_layout.addWidget(login_button)
        page_layout.addWidget(card, alignment=Qt.AlignmentFlag.AlignHCenter)
        page_layout.addStretch()
        self.set_page(page)
        self.password_input.setFocus()

    @staticmethod
    def add_label(layout: QBoxLayout, text: str, object_name: str) -> QLabel:
        label = QLabel(text)
        label.setObjectName(object_name)
        label.setWordWrap(True)
        layout.addWidget(label)
        return label

    def verify_password(self, supplied_password: str) -> None:
        if hmac.compare_digest(
            password_digest(supplied_password),
            self.admin_password_hash,
        ):
            self.show_dashboard()
            return

        self.failed_attempts += 1
        if self.failed_attempts >= 5:
            QMessageBox.critical(
                self,
                "Доступ закрыт",
                "Слишком много неверных попыток. Перезапусти приложение.",
            )
            self.close()
            return
        QMessageBox.warning(
            self,
            "Неверный пароль",
            f"Пароль не подошёл. Осталось попыток: {5 - self.failed_attempts}.",
        )

    def show_dashboard(self) -> None:
        page = QWidget()
        layout = QVBoxLayout(page)
        layout.setContentsMargins(22, 18, 22, 18)
        layout.setSpacing(14)

        header = QHBoxLayout()
        self.add_label(header, "USER DATABASE // LIVE MONITOR", "title")
        header.addStretch()
        refresh_button = QPushButton("[ ОБНОВИТЬ ]")
        refresh_button.clicked.connect(self.refresh_users)
        header.addWidget(refresh_button)
        layout.addLayout(header)

        self.add_label(
            layout,
            "СИСТЕМА: ПОДКЛЮЧЕНО  |  Отображаются только данные игры. "
            "Пароли хранятся как хэши и недоступны для просмотра.",
            "muted",
        )

        search_row = QHBoxLayout()
        self.add_label(search_row, "> ПОИСК ПО ИМЕНИ ИЛИ ПОЧТЕ:", "eyebrow")
        self.search_input = QLineEdit()
        self.search_input.setPlaceholderText("Введите имя или адрес почты")
        self.search_input.textChanged.connect(self.render_users)
        search_row.addWidget(self.search_input, stretch=1)
        layout.addLayout(search_row)

        self.table = QTableWidget(0, 7)
        self.table.setHorizontalHeaderLabels(
            (
                "Имя",
                "Почта",
                "Английский",
                "Регистрация",
                "Последняя активность",
                "Этап игры",
            )
        )
        self.table.setHorizontalHeaderItem(6, QTableWidgetItem("STATUS"))
        self.table.setEditTriggers(QAbstractItemView.EditTrigger.NoEditTriggers)
        self.table.setSelectionBehavior(QAbstractItemView.SelectionBehavior.SelectRows)
        self.table.setSelectionMode(QAbstractItemView.SelectionMode.SingleSelection)
        self.table.setAlternatingRowColors(True)
        self.table.verticalHeader().setVisible(False)
        self.table.verticalHeader().setDefaultSectionSize(34)
        self.table.horizontalHeader().setSectionResizeMode(
            QHeaderView.ResizeMode.ResizeToContents
        )
        self.table.horizontalHeader().setStretchLastSection(True)
        layout.addWidget(self.table, stretch=1)

        actions = QHBoxLayout()
        for label, handler in (
            ("BAN", self.ban_selected_user),
            ("UNBAN", self.unban_selected_user),
            ("RESET GAME", self.reset_selected_user),
            ("DELETE", self.delete_selected_user),
        ):
            button = QPushButton(label)
            button.clicked.connect(handler)
            actions.addWidget(button)
        layout.addLayout(actions)

        self.status_label = QLabel()
        self.status_label.setObjectName("status")
        layout.addWidget(self.status_label)
        self.set_page(page)
        self.refresh_users()
        self.refresh_timer.start()

    def auto_refresh(self) -> None:
        self.refresh_users(show_errors=False)

    @staticmethod
    def format_timestamp(timestamp: int | None) -> str:
        if not timestamp:
            return "Нет данных"
        return datetime.fromtimestamp(timestamp).strftime("%d.%m.%Y %H:%M")

    @staticmethod
    def format_stage(stage: int | None, completed: int | None) -> str:
        if completed:
            return "Завершено"
        if stage is None:
            return "Не начато"
        return GAME_STAGES.get(stage, "Не начато")

    def refresh_users(self, show_errors: bool = True) -> None:
        try:
            self.users = fetch_users()
        except sqlite3.Error as error:
            self.users = []
            if self.status_label is not None:
                self.status_label.setText(
                    f"Не удалось прочитать базу данных: {error}"
                )
            self.render_users()
            if show_errors:
                QMessageBox.critical(
                    self,
                    "Ошибка базы данных",
                    f"Проверь путь к базе:\n{DATABASE_PATH}\n\n{error}",
                )
            return

        self.render_users()

    def selected_user(self) -> dict | None:
        if self.table is None:
            return None
        row = self.table.currentRow()
        if row < 0:
            return None
        item = self.table.item(row, 0)
        return item.data(Qt.ItemDataRole.UserRole) if item else None

    def ban_selected_user(self) -> None:
        user = self.selected_user()
        if user:
            update_user_ban(user["id"], True, "Заблокирован администратором")
            self.refresh_users()

    def unban_selected_user(self) -> None:
        user = self.selected_user()
        if user:
            update_user_ban(user["id"], False)
            self.refresh_users()

    def reset_selected_user(self) -> None:
        user = self.selected_user()
        if user:
            reset_user_progress(user["id"])
            self.refresh_users()

    def delete_selected_user(self) -> None:
        user = self.selected_user()
        if not user:
            return
        answer = QMessageBox.question(
            self, "Delete user", f"Delete account {user['username']} permanently?"
        )
        if answer == QMessageBox.StandardButton.Yes:
            delete_user(user["id"])
            self.refresh_users()

    def render_users(self, query: str | None = None) -> None:
        if self.table is None or self.search_input is None:
            return
        if query is None:
            query = self.search_input.text()
        query = query.strip().casefold()
        matching_users = [
            user
            for user in self.users
            if query in user["username"].casefold()
            or query in user["email"].casefold()
        ]
        self.table.setRowCount(len(matching_users))
        for index, user in enumerate(matching_users):
            values = (
                user["username"],
                user["email"],
                user["english_level"],
                self.format_timestamp(user["created_at"]),
                self.format_timestamp(user["last_active_at"]),
                self.format_stage(user["stage"], user["completed"]),
                "BANNED" if user["banned_until"] > int(time.time()) else "ACTIVE",
            )
            for column, value in enumerate(values):
                item = QTableWidgetItem(str(value))
                item.setFlags(item.flags() & ~Qt.ItemFlag.ItemIsEditable)
                if column == 0:
                    item.setData(Qt.ItemDataRole.UserRole, user)
                self.table.setItem(index, column, item)
        if self.status_label is not None:
            self.status_label.setText(
                f"Пользователей: {len(self.users)} · "
                f"Показано: {len(matching_users)} · "
                f"Обновление каждые {REFRESH_INTERVAL_MS // 1000} сек."
            )


def main() -> None:
    import auth

    auth.initialize_database()
    application = QApplication(sys.argv)
    window = UserMonitorApp()
    window.show()
    sys.exit(application.exec())


if __name__ == "__main__":
    main()
