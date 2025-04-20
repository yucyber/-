class CandidateMessageSystem {
    constructor() {
        this.messages = [];
        this.websocket = null;
        this.messageContainer = document.getElementById('messageContainer');
        this.messageForm = document.getElementById('messageForm');
        this.messageInput = document.getElementById('messageInput');
        this.status = document.getElementById('status');

        this.initWebSocket();
        this.initEventListeners();
    }

    initWebSocket() {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.hostname}:3000`;

        this.websocket = new WebSocket(wsUrl);

        this.websocket.onopen = () => {
            console.log('WebSocket连接已建立');
            this.updateStatus('已连接到服务器');
        };

        this.websocket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                this.handleMessage(data);
            } catch (error) {
                console.error('消息解析错误:', error);
            }
        };

        this.websocket.onclose = () => {
            console.log('WebSocket连接已关闭');
            this.updateStatus('连接已断开，正在尝试重新连接...');
            this.attemptReconnect();
        };

        this.websocket.onerror = (error) => {
            console.error('WebSocket错误:', error);
            this.updateStatus('连接错误，请刷新页面重试');
        };
    }

    attemptReconnect() {
        setTimeout(() => {
            this.initWebSocket();
        }, 3000);
    }

    initEventListeners() {
        this.messageForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.sendMessage();
        });
    }

    sendMessage() {
        if (!this.messageInput.value.trim()) return;

        const message = {
            type: 'candidate',
            content: this.messageInput.value,
            timestamp: new Date().toISOString()
        };

        if (this.websocket.readyState === WebSocket.OPEN) {
            this.websocket.send(JSON.stringify(message));
            this.messageInput.value = '';
        } else {
            this.updateStatus('连接已断开，无法发送消息');
        }
    }

    handleMessage(data) {
        this.messages.push(data);
        this.renderMessages();
    }

    renderMessages() {
        this.messageContainer.innerHTML = '';
        this.messages.forEach(msg => {
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${msg.type}`;

            const content = document.createElement('div');
            content.textContent = msg.content;

            const timestamp = document.createElement('span');
            timestamp.className = 'timestamp';
            timestamp.textContent = new Date(msg.timestamp).toLocaleString();

            messageDiv.appendChild(content);
            messageDiv.appendChild(timestamp);
            this.messageContainer.appendChild(messageDiv);
        });

        this.messageContainer.scrollTop = this.messageContainer.scrollHeight;
    }

    updateStatus(text) {
        this.status.textContent = text;
    }
}

// 初始化考生留言系统
document.addEventListener('DOMContentLoaded', () => {
    new CandidateMessageSystem();
}); 