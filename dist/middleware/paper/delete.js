"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const TestPaper_1 = require("../../entity/TestPaper");
const Test_1 = require("../../entity/Test");
const Candidate_1 = __importDefault(require("../../entity/Candidate"));
const responseClass_1 = __importDefault(require("../../config/responseClass"));
exports.default = async (ctx) => {
    try {
        const { paper } = ctx.request.body;
        const paperRepository = (0, typeorm_1.getRepository)(TestPaper_1.TestPaper);
        const testRepository = (0, typeorm_1.getRepository)(Test_1.Test);
        const candidateRepository = (0, typeorm_1.getRepository)(Candidate_1.default);
        const paperEntity = await paperRepository.findOne({
            where: { paper_name: paper },
            relations: ["tests"],
        });
        if (!paperEntity) {
            ctx.status = 404;
            ctx.body = new responseClass_1.default(404, "试卷不存在", { status: false });
            return;
        }
        // 删除相关的试题
        if (paperEntity.tests && paperEntity.tests.length > 0) {
            await testRepository.remove(paperEntity.tests);
        }
        // 删除相关的候选人信息
        const candidates = await candidateRepository.find({
            where: { paper },
        });
        if (candidates && candidates.length > 0) {
            await candidateRepository.remove(candidates);
        }
        // 删除试卷
        await paperRepository.remove(paperEntity);
        ctx.status = 200;
        ctx.body = new responseClass_1.default(200, "删除成功", { status: true });
    }
    catch (error) {
        ctx.status = 500;
        ctx.body = new responseClass_1.default(500, "服务器错误", { status: false, error: error instanceof Error ? error.message : String(error) });
    }
};
//# sourceMappingURL=delete.js.map