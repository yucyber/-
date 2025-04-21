import { Context } from 'koa';
import { WebSocket, RawData } from "ws";
import { getRepository } from "typeorm";
import { Test } from "../../entity/Test";
import { TestPaper } from "../../entity/TestPaper";
import { nowTime } from "../../config/utils";
import responseClass from '../../config/responseClass';

interface WebSocketMessage {
  inputInform: string;
  id: string;
  interviewIdentity: string;
  cookie: string;
}

export default (ctx: Context, next) => {
  try {
    const wss = new WebSocket.Server({ port: 8888 });
    let clients: Array<{ ws: WebSocket }> = [];
    let retMsg: Array<{ time: any, identity: string, msg: string, id?: string, name?: string }> = [];

    function wsSend(data: { time: any, identity: string, msg: string, id?: string, name?: string }) {
      let { time, identity, msg, id, name } = data;
      retMsg.push({ time, identity, msg, id, name });
      const len = retMsg.length;
      //遍历客户端
      for (var i = 0; i < clients.length; i++) {
        //声明客户端
        var clientSocket = clients[i].ws;
        if (clientSocket.readyState === WebSocket.OPEN) {
          //客户端发送处理过的信息
          clientSocket.send(JSON.stringify(retMsg));
        }
      }
    }

    wss.on('connection', async function connection(ws, req) {
      if (ws.readyState === WebSocket.OPEN) {
        const time = nowTime({ click: true });
        const identity = '系统';
        const msg = '您已连接到服务器';
        retMsg.push({ time, identity, msg })
        ws.send(JSON.stringify(retMsg));
      }

      ws.on('message', async function incoming(message: RawData) {
        try {
          const messageStr = message.toString();
          const { inputInform, id, interviewIdentity, cookie } = JSON.parse(messageStr) as WebSocketMessage;

          const testRepository = getRepository(Test);
          const paperRepository = getRepository(TestPaper);

          const test = await testRepository.findOne({
            where: { test_name: id },
          });

          if (!test) {
            ws.send(JSON.stringify(new responseClass(404, "试题不存在", { status: false })));
            return;
          }

          // 发送消息给所有连接的客户端
          ws.send(JSON.stringify(new responseClass(200, "消息发送成功", {
            status: true,
            data: {
              inputInform,
              id,
              interviewIdentity,
            }
          })));
        } catch (error) {
          ws.send(JSON.stringify(new responseClass(500, "消息处理失败", {
            status: false,
            error: error instanceof Error ? error.message : String(error)
          })));
        }
      });
    });
  } catch (error) {
    ctx.status = 500;
    ctx.body = new responseClass(500, "服务器错误", { status: false, error: error instanceof Error ? error.message : String(error) });
  }
};