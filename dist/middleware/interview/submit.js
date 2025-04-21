"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const Interview_1 = __importDefault(require("../../entity/Interview"));
const responseClass_1 = __importDefault(require("../../config/responseClass"));
exports.default = async (ctx) => {
    const { submitArr } = ctx.request.body;
    const { evaluation, comment, interviewer_link } = submitArr;
    const interviewRepository = (0, typeorm_1.getManager)().getRepository(Interview_1.default);
    const saveInterview = await interviewRepository.findOne({ where: { interviewer_link } });
    if (!saveInterview) {
        ctx.body = new responseClass_1.default(404, '面试记录未找到', { status: false });
        return;
    }
    saveInterview.evaluation = evaluation;
    saveInterview.comment = comment;
    await interviewRepository.save(saveInterview);
    ctx.body = new responseClass_1.default(200, '面试结果保存成功', { status: true });
};
//# sourceMappingURL=submit.js.map