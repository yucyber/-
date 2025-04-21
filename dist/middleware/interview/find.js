"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const Interview_1 = __importDefault(require("../../entity/Interview"));
const responseClass_1 = __importDefault(require("../../config/responseClass"));
const User_1 = __importDefault(require("../../entity/User"));
exports.default = async (ctx) => {
    const { interviewer, findArr, cookie, isInterviewer } = ctx.request.body;
    const interviewRepository = (0, typeorm_1.getManager)().getRepository(Interview_1.default);
    if (cookie) {
        const userRepository = (0, typeorm_1.getManager)().getRepository(User_1.default);
        const user = await userRepository.findOne({ where: { session: cookie } });
        if (!user) {
            ctx.body = new responseClass_1.default(400, '用户未找到', { status: false });
            return;
        }
        const email = user.email;
        if (isInterviewer === true) {
            const findInterviewer = await interviewRepository.find({ where: { interviewer: [email] } });
            console.log('interviewer', findInterviewer);
            ctx.body = new responseClass_1.default(200, '该面试官所有面试间信息查找完毕', { ret: findInterviewer });
        }
        else {
            const findCandidate = await interviewRepository.find({ where: { candidate: email } });
            console.log('candidate', findCandidate);
            ctx.body = new responseClass_1.default(200, '该候选人所有面试间信息查找完毕', { ret: findCandidate });
        }
    }
    else if (interviewer) {
        const findInterviewInfrom = await interviewRepository.find({ where: { interviewer: [interviewer] } });
        ctx.body = new responseClass_1.default(200, '该面试官的面试间信息查询成功', { ret: findInterviewInfrom });
    }
    else if (findArr) {
        const { interviewer, interview_room, interviewer_link } = findArr;
        const findInterviewer = await interviewRepository.findOne({
            where: {
                interviewer: [interviewer],
                interview_room,
                interviewer_link
            }
        });
        if (findInterviewer) {
            ctx.body = new responseClass_1.default(200, '该面试官指定的面试间信息查找完毕', { status: true });
        }
        else {
            ctx.body = new responseClass_1.default(200, '该面试间不存在，请重新输入', { status: false });
        }
    }
};
//# sourceMappingURL=find.js.map