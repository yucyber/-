import 'dotenv/config';
import Koa from 'koa';
import Router from 'koa-router';
import bodyParser from 'koa-bodyparser';
import cors from 'koa2-cors';
import websockify from 'koa-websocket';
import { createConnection } from "typeorm";
import { AddressInfo } from 'net';
import serve from 'koa-static';
import path from 'path';
import { TestService } from './service/test.service';
import { databaseConfig } from './config/database';

import { ORIGINIP, WS_TYPE } from './config/const';
import authenticate from './middleware/authenticate';

import email from './middleware/user/email';
import login from './middleware/user/login';
import register from './middleware/user/register';
import logout from './middleware/user/logout';
import searchEmail from './middleware/user/searchEmail';

import paper from './middleware/paper/show';
import addPaper from './middleware/paper/add';
import deletePaper from './middleware/paper/delete';
import modifyPaper from './middleware/paper/modify';
import lookOver from './middleware/paper/lookOver';

import addTest from './middleware/test/add';
import showTest from './middleware/test/show';
import cleanupTest from './middleware/test/cleanup';
import updateTestCase from './middleware/test/update-testcase';

import submit from './middleware/candidate/submit';
import search from './middleware/candidate/search';
import comment from './middleware/candidate/comment';
import runCode from './middleware/candidate/run';

import createInterview from './middleware/interview/create';
import findInterview from './middleware/interview/find';
import submitInterview from './middleware/interview/submit';
import deleteInterview from './middleware/interview/delete';

import { nowTime } from './config/utils';
import WebSocketApi from './middleware/candidate/websocket';
import WebSocket from 'ws';
import { TextOperation, Server, } from 'ot';
import ot from 'ot';
// import EditorSocketIOServer from 'ot.js/socketio-server.js';

interface msgObj {
  time: string;
  identity: string;
  msg: string;
  name: string;
}

// 定义错误接口
interface ServerError extends Error {
  status?: number;
  code?: string;
}

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
async function startServer(app: Koa, startPort: number, maxRetries: number = 10): Promise<void> {
  for (let port = startPort; port < startPort + maxRetries; port++) {
    try {
      const server = app.listen(port);

      await new Promise<void>((resolve, reject) => {
        server.on('listening', () => {
          const address = server.address() as AddressInfo;
          console.log(`服务器成功运行在端口 ${address.port}`);
          isStarting = false;
          resolve();
        });

        server.on('error', (err: ServerError) => {
          if (err.code === 'EADDRINUSE') {
            console.log(`端口 ${port} 已被占用，尝试下一个端口...`);
            server.close();
            if (port === startPort + maxRetries - 1) {
              reject(new Error('没有可用的端口'));
            }
          } else {
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
    } catch (err) {
      if (port === startPort + maxRetries - 1) {
        throw err;
      }
    }
  }
}

createConnection(databaseConfig)
  .then(async connection => {
    try {
      console.log('数据库连接成功');

      const app = new Koa();
      const router = new Router();

      // 处理cookie跨域
      const corsOptions = {
        origin: function (ctx) {
          return ctx.request.header.origin || 'http://localhost:3002';
        },
        credentials: true,
        allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowHeaders: ['Content-Type', 'Authorization', 'Accept'],
        maxAge: 86400
      }
      app.use(cors(corsOptions));

      // 添加静态文件服务
      const publicPath = path.join(__dirname, '../public');
      console.log('静态文件路径:', publicPath);
      app.use(serve(publicPath));

      // 添加根路由重定向
      app.use(async (ctx, next) => {
        if (ctx.path === '/') {
          ctx.redirect('/login.html');
        } else {
          await next();
        }
      });

      // 处理 post 请求的参数
      app.use(bodyParser());

      // 错误处理中间件
      app.use(async (ctx, next) => {
        try {
          await next();
        } catch (err) {
          const serverError = err as ServerError;
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
      app.use(authenticate);

      // 配置路由
      router.post('/api/email', email);
      router.post('/api/login', login);
      router.post('/api/register', register);
      router.post('/api/logout', logout);
      router.post('/api/search_email', searchEmail);

      // 试卷相关路由
      router.post('/api/paper/show', paper);
      router.post('/api/paper/add', addPaper);
      router.post('/api/paper/delete', deletePaper);
      router.post('/api/paper/modify', modifyPaper);
      router.post('/api/paper/look_over', lookOver);

      // 题目相关路由
      router.post('/api/test/add', addTest);
      router.post('/api/test/show', showTest);
      router.post('/api/test/cleanup', cleanupTest);
      router.post('/api/test/update-testcase', updateTestCase);

      // 候选人相关路由
      router.post('/api/candidate/submit', submit);
      router.post('/api/candidate/search', search);
      router.post('/api/candidate/comment', comment);
      router.post('/api/candidate/run', runCode);

      // 面试相关路由
      router.post('/api/interview/create', createInterview);
      router.post('/api/interview/find', findInterview);
      router.post('/api/interview/submit', submitInterview);
      router.post('/api/interview/delete', deleteInterview);

      // Test APIs
      router.post('/api/tests', async (ctx) => {
        try {
          const test = await TestService.createTest(ctx.request.body);
          ctx.status = 200;
          ctx.body = { code: 200, msg: '创建成功', data: test };
        } catch (error: any) {
          ctx.status = 400;
          ctx.body = { code: 400, msg: error.message };
        }
      });

      router.put('/api/tests/:key', async (ctx) => {
        try {
          const test = await TestService.updateTest(Number(ctx.params.key), ctx.request.body);
          ctx.status = 200;
          ctx.body = { code: 200, msg: '更新成功', data: test };
        } catch (error: any) {
          ctx.status = 400;
          ctx.body = { code: 400, msg: error.message };
        }
      });

      router.delete('/api/tests/:key', async (ctx) => {
        try {
          await TestService.deleteTest(Number(ctx.params.key));
          ctx.status = 200;
          ctx.body = { code: 200, msg: '删除成功' };
        } catch (error: any) {
          ctx.status = 400;
          ctx.body = { code: 400, msg: error.message };
        }
      });

      router.get('/api/tests/:key', async (ctx) => {
        try {
          const test = await TestService.getTestById(Number(ctx.params.key));
          ctx.status = 200;
          ctx.body = { code: 200, msg: '获取成功', data: test };
        } catch (error: any) {
          ctx.status = 400;
          ctx.body = { code: 400, msg: error.message };
        }
      });

      router.get('/api/papers/:paperKey/tests', async (ctx) => {
        try {
          const tests = await TestService.getTestsByPaper(Number(ctx.params.paperKey));
          ctx.status = 200;
          ctx.body = { code: 200, msg: '获取成功', data: tests };
        } catch (error: any) {
          ctx.status = 400;
          ctx.body = { code: 400, msg: error.message };
        }
      });

      // 使用路由中间件
      app.use(router.routes());
      app.use(router.allowedMethods());

      // 启动服务器
      const port = process.env.PORT ? parseInt(process.env.PORT) : 3002;
      await startServer(app, port);

    } catch (err) {
      console.error('服务器启动失败:', err);
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('数据库连接失败:', error);
    process.exit(1);
  });