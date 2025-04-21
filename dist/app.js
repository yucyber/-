"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const koa_1 = __importDefault(require("koa"));
const koa_router_1 = __importDefault(require("koa-router"));
const koa_bodyparser_1 = __importDefault(require("koa-bodyparser"));
const koa2_cors_1 = __importDefault(require("koa2-cors"));
const typeorm_1 = require("typeorm");
const koa_static_1 = __importDefault(require("koa-static"));
const path_1 = __importDefault(require("path"));
const const_1 = require("./config/const");
const authenticate_1 = __importDefault(require("./middleware/authenticate"));
const email_1 = __importDefault(require("./middleware/user/email"));
const login_1 = __importDefault(require("./middleware/user/login"));
const register_1 = __importDefault(require("./middleware/user/register"));
const logout_1 = __importDefault(require("./middleware/user/logout"));
const searchEmail_1 = __importDefault(require("./middleware/user/searchEmail"));
const show_1 = __importDefault(require("./middleware/paper/show"));
const add_1 = __importDefault(require("./middleware/paper/add"));
const delete_1 = __importDefault(require("./middleware/paper/delete"));
const modify_1 = __importDefault(require("./middleware/paper/modify"));
const lookOver_1 = __importDefault(require("./middleware/paper/lookOver"));
const add_2 = __importDefault(require("./middleware/test/add"));
const show_2 = __importDefault(require("./middleware/test/show"));
const submit_1 = __importDefault(require("./middleware/candidate/submit"));
const search_1 = __importDefault(require("./middleware/candidate/search"));
const comment_1 = __importDefault(require("./middleware/candidate/comment"));
const create_1 = __importDefault(require("./middleware/interview/create"));
const find_1 = __importDefault(require("./middleware/interview/find"));
const submit_2 = __importDefault(require("./middleware/interview/submit"));
const delete_2 = __importDefault(require("./middleware/interview/delete"));
// 设置全局超时检测
const TIMEOUT = 30000; // 30 秒
let isStarting = false;
// 创建一个超时检测函数
function checkTimeout() {
    if (isStarting) {
        console.error('服务器启动超时，正在退出...');
        process.exit(1);
    }
}
// 设置超时检测
setTimeout(checkTimeout, TIMEOUT);
// 标记开始启动
isStarting = true;
// 尝试启动服务器的函数
async function startServer(app, startPort, maxRetries = 10) {
    for (let port = startPort; port < startPort + maxRetries; port++) {
        try {
            const server = app.listen(port);
            await new Promise((resolve, reject) => {
                server.on('listening', () => {
                    const address = server.address();
                    console.log(`服务器成功运行在端口 ${address.port}`);
                    isStarting = false;
                    resolve();
                });
                server.on('error', (err) => {
                    if (err.code === 'EADDRINUSE') {
                        console.log(`端口 ${port} 已被占用，尝试下一个端口...`);
                        server.close();
                        if (port === startPort + maxRetries - 1) {
                            reject(new Error('没有可用的端口'));
                        }
                    }
                    else {
                        reject(err);
                    }
                });
            });
            // 处理进程信号
            process.on('SIGTERM', () => {
                console.log('收到 SIGTERM 信号，正在关闭服务器...');
                server.close(() => {
                    console.log('服务器已关闭');
                    process.exit(0);
                });
            });
            // 如果成功启动，跳出循环
            break;
        }
        catch (err) {
            if (port === startPort + maxRetries - 1) {
                throw err;
            }
        }
    }
}
(0, typeorm_1.createConnections)()
    .then(async (connections) => {
    try {
        // 确保数据库连接可用
        const connectionManager = (0, typeorm_1.getConnectionManager)();
        // 设置默认连接
        const alimydbConnection = connectionManager.get('alimydb');
        if (!alimydbConnection.isConnected) {
            await alimydbConnection.connect();
        }
        const examydbConnection = connectionManager.get('examydb');
        if (!examydbConnection.isConnected) {
            await examydbConnection.connect();
        }
        console.log('数据库连接成功');
        const app = new koa_1.default();
        const router = new koa_router_1.default();
        // 处理cookie跨域
        const corsOptions = {
            origin: const_1.ORIGINIP,
            credentials: true,
            optionSuccessStatus: 200
        };
        app.use((0, koa2_cors_1.default)(corsOptions));
        // 添加静态文件服务
        app.use((0, koa_static_1.default)(path_1.default.join(__dirname, '../public')));
        // 处理 post 请求的参数
        app.use((0, koa_bodyparser_1.default)());
        // 错误处理中间件
        app.use(async (ctx, next) => {
            try {
                await next();
            }
            catch (err) {
                const serverError = err;
                console.error('服务器错误:', serverError);
                ctx.status = serverError.status || 500;
                ctx.body = {
                    message: '服务器内部错误',
                    error: serverError.message,
                    stack: serverError.stack
                };
            }
        });
        // 根据登录状态设置登录拦截
        app.use(authenticate_1.default);
        // 配置路由
        router.post('/api/email', email_1.default);
        router.post('/api/login', login_1.default);
        router.post('/api/register', register_1.default);
        router.post('/api/logout', logout_1.default);
        router.post('/api/search_email', searchEmail_1.default);
        // 试卷相关路由
        router.post('/api/paper/show', show_1.default);
        router.post('/api/paper/add', add_1.default);
        router.post('/api/paper/delete', delete_1.default);
        router.post('/api/paper/modify', modify_1.default);
        router.post('/api/paper/look_over', lookOver_1.default);
        // 题目相关路由
        router.post('/api/test/add', add_2.default);
        router.post('/api/test/show', show_2.default);
        // 候选人相关路由
        router.post('/api/candidate/submit', submit_1.default);
        router.post('/api/candidate/search', search_1.default);
        router.post('/api/candidate/comment', comment_1.default);
        // 面试相关路由
        router.post('/api/interview/create', create_1.default);
        router.post('/api/interview/find', find_1.default);
        router.post('/api/interview/submit', submit_2.default);
        router.post('/api/interview/delete', delete_2.default);
        // 使用路由中间件
        app.use(router.routes());
        app.use(router.allowedMethods());
        // 启动服务器（自动尝试不同端口）
        const startPort = Number(process.env.PORT) || 3001;
        await startServer(app, startPort);
    }
    catch (err) {
        console.error('服务器启动错误:', err);
        process.exit(1);
    }
})
    .catch(error => {
    console.error('数据库连接错误:', error);
    process.exit(1);
});
//# sourceMappingURL=app.js.map