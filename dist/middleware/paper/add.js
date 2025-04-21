"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const TestPaper_1 = __importDefault(require("../../entity/TestPaper"));
const User_1 = __importDefault(require("../../entity/User"));
const responseClass_1 = __importDefault(require("../../config/responseClass"));
exports.default = async (ctx) => {
    try {
        const { values, cookie } = ctx.request.body;
        const userRepository = (0, typeorm_1.getConnection)('alimydb').getRepository(User_1.default);
        const findUser = await userRepository.findOne({ where: { session: cookie } });
        if (!findUser) {
            ctx.body = new responseClass_1.default(400, '用户未找到', { status: false });
            return;
        }
        const interviewerEmail = findUser.email;
        const paperRepository = (0, typeorm_1.getConnection)('examydb').getRepository(TestPaper_1.default);
        const findPaper = await paperRepository.findOne({ where: { paper_name: values.paper } });
        // 根据候选人邮箱发送邮件通知
        if (values.candidate && values.candidate.length > 0) {
            for (let ret of values.candidate) {
                const mail = {
                    from: '1164939253@qq.com',
                    to: ret,
                    subject: '在线编程笔试平台',
                    text: '您收到一位面试官的邀请，可进入该网站 http://www.syandeg.com 查看试卷并填写!'
                };
                // nodemail(mail);
            }
        }
        // 查看该试卷是否已经存在于数据库中
        if (!findPaper) {
            const timeBegin = new Date(values.timeBegin).getTime();
            const timeEnd = new Date(values.timeEnd).getTime();
            const nowtime = new Date().getTime();
            const newPaper = new TestPaper_1.default();
            newPaper.interviewer = interviewerEmail;
            newPaper.paper_name = values.paper;
            newPaper.description = values.paperDescription;
            newPaper.candidate = values.candidate ? values.candidate.join(',') : '';
            newPaper.time_begin = timeBegin;
            newPaper.time_end = timeEnd;
            newPaper.remaining_time = nowtime >= timeBegin && nowtime <= timeEnd;
            await paperRepository.save(newPaper);
            ctx.body = new responseClass_1.default(200, '试卷新建成功，并已通知候选人', { status: true });
        }
        else {
            ctx.body = new responseClass_1.default(200, '该试卷已存在，请新建试卷', { status: false });
        }
    }
    catch (error) {
        ctx.body = new responseClass_1.default(500, '服务器错误', { status: false, error: error instanceof Error ? error.message : String(error) });
    }
};
//# sourceMappingURL=add.js.map