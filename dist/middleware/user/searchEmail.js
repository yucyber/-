"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const User_1 = __importDefault(require("../../entity/User"));
const responseClass_1 = __importDefault(require("../../config/responseClass"));
exports.default = async (ctx) => {
    const { cookie, interviewer } = ctx.request.body;
    const userRepository = (0, typeorm_1.getManager)().getRepository(User_1.default);
    if (cookie) {
        const ret = await userRepository.findOne({ where: { session: cookie } });
        if (!ret) {
            ctx.body = new responseClass_1.default(200, '用户未登录', { identity: null });
            return;
        }
        const identity = ret.interviewer === true ? '面试官' : '候选人';
        ctx.body = new responseClass_1.default(200, '当前用户信息获取成功', { identity });
    }
    else if (interviewer === false) {
        const ret = await userRepository.find({ where: { interviewer: false } });
        ctx.body = new responseClass_1.default(200, '候选人邮箱获取成功', { ret });
    }
    else if (interviewer === true) {
        const ret = await userRepository.find({ where: { interviewer: true } });
        ctx.body = new responseClass_1.default(200, '面试官邮箱获取成功', { ret });
    }
    else {
        const ret = await userRepository.find();
        ctx.body = new responseClass_1.default(200, '所有用户信息获取成功', { ret });
    }
};
//# sourceMappingURL=searchEmail.js.map