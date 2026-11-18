CREATE DATABASE IF NOT EXISTS freak_circus_db;

USE freak_circus_db;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    glitters INT DEFAULT 0,
    rank_level VARCHAR(50) DEFAULT 'Базовый уровень',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_profiles (
    user_id INT PRIMARY KEY,
    display_name VARCHAR(32) NOT NULL,
    date_of_birth DATE,
    phone VARCHAR(32),
    avatar_data MEDIUMTEXT,
    avatar_mime_type VARCHAR(16),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);