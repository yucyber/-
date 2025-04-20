const WebSocket = require('ws');

// 创建WebSocket服务器，监听3000端口
const wss = new WebSocket.Server({ port: 3000 });

// 存储所有连接的客户端
const clients = new Set();

// 监听连接事件
wss.on('connection', (ws) => {
    console.log('新的客户端连接');
    clients.add(ws);

    // 监听消息事件
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            console.log('收到消息:', data);

            // 广播消息给所有连接的客户端
            clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(data));
                }
            });
        } catch (error) {
            console.error('消息处理错误:', error);
        }
    });

    // 监听关闭事件
    ws.on('close', () => {
        console.log('客户端断开连接');
        clients.delete(ws);
    });

    // 监听错误事件
    ws.on('error', (error) => {
        console.error('WebSocket错误:', error);
        clients.delete(ws);
    });
});

console.log('WebSocket服务器已启动，监听端口3000'); 