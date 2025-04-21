-- 创建数据库
CREATE DATABASE IF NOT EXISTS alimydb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS examydb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 创建用户并授权
CREATE USER IF NOT EXISTS 'root'@'localhost' IDENTIFIED BY '123456';
GRANT ALL PRIVILEGES ON alimydb.* TO 'root'@'localhost';
GRANT ALL PRIVILEGES ON examydb.* TO 'root'@'localhost';
FLUSH PRIVILEGES; 