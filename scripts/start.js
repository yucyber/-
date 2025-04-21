const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// 检查scripts目录是否存在
const scriptsDir = path.join(__dirname);
if (!fs.existsSync(scriptsDir)) {
    fs.mkdirSync(scriptsDir, { recursive: true });
}

console.log('正在初始化数据库...');

// 运行数据库初始化脚本
const initDb = spawn('node', [path.join(__dirname, 'init-db.js')], {
    stdio: 'inherit'
});

// 监听数据库初始化脚本的退出事件
initDb.on('close', (code) => {
    if (code !== 0) {
        console.error(`数据库初始化失败，退出码：${code}`);
        return;
    }

    console.log('数据库初始化成功，正在启动服务器...');

    // 启动服务器
    const server = spawn('npm', ['run', 'dev'], {
        stdio: 'inherit',
        shell: true
    });

    // 监听服务器的退出事件
    server.on('close', (code) => {
        console.log(`服务器已关闭，退出码：${code}`);
    });
}); 