"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const typeorm_1 = require("typeorm");
const Test_1 = require("../../entity/Test");
const TestPaper_1 = require("../../entity/TestPaper");
const utils_1 = require("../../config/utils");
const responseClass_1 = __importDefault(require("../../config/responseClass"));
exports.default = (ctx, next) => {
    try {
        const wss = new ws_1.WebSocket.Server({ port: 8888 });
        let clients = [];
        let retMsg = [];
        function wsSend(data) {
            let { time, identity, msg, id, name } = data;
            retMsg.push({ time, identity, msg, id, name });
            const len = retMsg.length;
            //遍历客户端
            for (var i = 0; i < clients.length; i++) {
                //声明客户端
                var clientSocket = clients[i].ws;
                if (clientSocket.readyState === ws_1.WebSocket.OPEN) {
                    //客户端发送处理过的信息
                    clientSocket.send(JSON.stringify(retMsg));
                }
            }
        }
        wss.on('connection', async function connection(ws, req) {
            if (ws.readyState === ws_1.WebSocket.OPEN) {
                const time = (0, utils_1.nowTime)({ click: true });
                const identity = '系统';
                const msg = '您已连接到服务器';
                retMsg.push({ time, identity, msg });
                ws.send(JSON.stringify(retMsg));
            }
            ws.on('message', async function incoming(message) {
                try {
                    const messageStr = message.toString();
                    const { inputInform, id, interviewIdentity, cookie } = JSON.parse(messageStr);
                    const testRepository = (0, typeorm_1.getRepository)(Test_1.Test);
                    const paperRepository = (0, typeorm_1.getRepository)(TestPaper_1.TestPaper);
                    const test = await testRepository.findOne({
                        where: { test_name: id },
                    });
                    if (!test) {
                        ws.send(JSON.stringify(new responseClass_1.default(404, "试题不存在", { status: false })));
                        return;
                    }
                    // 发送消息给所有连接的客户端
                    ws.send(JSON.stringify(new responseClass_1.default(200, "消息发送成功", {
                        status: true,
                        data: {
                            inputInform,
                            id,
                            interviewIdentity,
                        }
                    })));
                }
                catch (error) {
                    ws.send(JSON.stringify(new responseClass_1.default(500, "消息处理失败", {
                        status: false,
                        error: error instanceof Error ? error.message : String(error)
                    })));
                }
            });
        });
    }
    catch (error) {
        ctx.status = 500;
        ctx.body = new responseClass_1.default(500, "服务器错误", { status: false, error: error instanceof Error ? error.message : String(error) });
    }
};
//# sourceMappingURL=websocket.js.map