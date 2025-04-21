"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const Interview_1 = __importDefault(require("../../entity/Interview"));
const responseClass_1 = __importDefault(require("../../config/responseClass"));
exports.default = async (ctx) => {
    try {
        const { inform } = ctx.request.body;
        const interviewRepository = (0, typeorm_1.getRepository)(Interview_1.default);
        const interview = await interviewRepository.findOne({
            where: { id: inform.id },
        });
        if (!interview) {
            ctx.status = 404;
            ctx.body = new responseClass_1.default(404, "面试记录不存在", { status: false });
            return;
        }
        await interviewRepository.remove(interview);
        ctx.status = 200;
        ctx.body = new responseClass_1.default(200, "删除成功", { status: true });
    }
    catch (error) {
        ctx.status = 500;
        ctx.body = new responseClass_1.default(500, "服务器错误", { status: false, error: error instanceof Error ? error.message : String(error) });
    }
};
//# sourceMappingURL=delete.js.map