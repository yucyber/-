const mysql = require('mysql');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// 加载环境变量
dotenv.config({ path: path.join(__dirname, '../.env') });

// 创建连接
const connection = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
});

// 连接到MySQL
connection.connect(err => {
    if (err) {
        console.error('连接MySQL失败:', err);
        process.exit(1);
    }

    console.log('已连接到MySQL服务器');

    // 创建数据库
    connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'examydb'} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`, (err) => {
        if (err) {
            console.error('创建数据库失败:', err);
            connection.end();
            process.exit(1);
        }

        console.log(`数据库 ${process.env.DB_NAME || 'examydb'} 创建成功或已存在`);

        // 使用该数据库
        connection.query(`USE ${process.env.DB_NAME || 'examydb'}`, (err) => {
            if (err) {
                console.error('使用数据库失败:', err);
                connection.end();
                process.exit(1);
            }

            console.log(`已切换到 ${process.env.DB_NAME || 'examydb'} 数据库`);

            // 关闭连接
            connection.end();
            console.log('初始化完成');
        });
    });
}); 