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