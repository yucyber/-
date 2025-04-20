class InterviewerMessageSystem {
    constructor() {
        this.messages = [];
        this.websocket = null;
        this.selectedMessage = null;
        this.messageContainer = document.getElementById('messageContainer');
        this.messageForm = document.getElementById('messageForm');
        this.messageInput = document.getElementById('messageInput');
        this.status = document.getElementById('status');
        this.replyInfo = document.getElementById('replyInfo');

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
            this.sendReply();
        });
    }

    sendReply() {
        if (!this.selectedMessage || !this.messageInput.value.trim()) return;

        const reply = {
            type: 'interviewer',
            content: this.messageInput.value,
            timestamp: new Date().toISOString(),
            replyTo: this.selectedMessage.id
        };

        if (this.websocket.readyState === WebSocket.OPEN) {
            this.websocket.send(JSON.stringify(reply));
            this.messageInput.value = '';
            this.messageInput.disabled = true;
            this.messageForm.querySelector('button').disabled = true;
            this.selectedMessage = null;
            this.updateReplyInfo();
        } else {
            this.updateStatus('连接已断开，无法发送回复');
        }
    }

    handleMessage(data) {
        // 确保消息有唯一ID
        const message = {
            ...data,
            id: data.id || Date.now().toString()
        };

        // 添加到消息列表
        this.messages.push(message);
        this.renderMessages();

        // 如果是新的考生消息，滚动到底部
        if (message.type === 'candidate') {
            this.messageContainer.scrollTop = this.messageContainer.scrollHeight;
        }
    }

    selectMessage(message) {
        if (message.type !== 'candidate') return;

        this.selectedMessage = message;
        this.updateReplyInfo();
        this.messageInput.disabled = false;
        this.messageForm.querySelector('button').disabled = false;
        this.renderMessages();
    }

    updateReplyInfo() {
        if (this.selectedMessage) {
            this.replyInfo.textContent = `正在回复: "${this.selectedMessage.content}"`;
            this.messageInput.placeholder = '输入回复内容...';
        } else {
            this.replyInfo.textContent = '请选择要回复的留言';
            this.messageInput.placeholder = '请先选择要回复的留言';
        }
    }

    renderMessages() {
        this.messageContainer.innerHTML = '';

        this.messages.forEach(msg => {
            const messageDiv = document.createElement('div');
            messageDiv.className = 'message';
            messageDiv.classList.add(msg.type);

            if (this.selectedMessage && this.selectedMessage.id === msg.id) {
                messageDiv.classList.add('selected');
            }

            if (msg.type === 'candidate') {
                messageDiv.style.cursor = 'pointer';
                messageDiv.title = '点击回复此消息';
                messageDiv.onclick = () => this.selectMessage(msg);
            }

            if (msg.type === 'interviewer' && msg.replyTo) {
                const replyToMessage = this.messages.find(m => m.id === msg.replyTo);
                if (replyToMessage) {
                    const replyInfo = document.createElement('div');
                    replyInfo.className = 'reply-to';
                    replyInfo.textContent = `回复: "${replyToMessage.content}"`;
                    messageDiv.appendChild(replyInfo);
                }
            }

            const contentDiv = document.createElement('div');
            contentDiv.className = 'message-content';
            contentDiv.textContent = msg.content;
            messageDiv.appendChild(contentDiv);

            const timestampDiv = document.createElement('div');
            timestampDiv.className = 'timestamp';
            timestampDiv.textContent = new Date(msg.timestamp).toLocaleString();
            messageDiv.appendChild(timestampDiv);

            this.messageContainer.appendChild(messageDiv);
        });

        this.messageContainer.scrollTop = this.messageContainer.scrollHeight;
    }

    updateStatus(text) {
        this.status.textContent = text;
    }
}

// 初始化面试官留言系统
document.addEventListener('DOMContentLoaded', () => {
    new InterviewerMessageSystem();
}); 