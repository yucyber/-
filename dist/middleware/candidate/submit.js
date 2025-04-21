"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const Candidate_1 = __importDefault(require("../../entity/Candidate"));
const TestPaper_1 = __importDefault(require("../../entity/TestPaper"));
const responseClass_1 = __importDefault(require("../../config/responseClass"));
const Test_1 = require("../../entity/Test");
exports.default = async (ctx) => {
    try {
        const req = ctx.request.body;
        const testRepository = (0, typeorm_1.getRepository)(Test_1.Test);
        const paperRepository = (0, typeorm_1.getRepository)(TestPaper_1.default);
        const candidateRepository = (0, typeorm_1.getRepository)(Candidate_1.default);
        const paperEntity = await paperRepository.findOne({
            where: { paper_name: req.paper },
        });
        if (!paperEntity) {
            ctx.status = 404;
            ctx.body = new responseClass_1.default(404, "试卷不存在", { status: false });
            return;
        }
        const testEntity = await testRepository.findOne({
            where: {
                paper: paperEntity,
                test_name: req.testName,
            },
        });
        if (!testEntity) {
            ctx.status = 404;
            ctx.body = new responseClass_1.default(404, "试题不存在", { status: false });
            return;
        }
        const candidate = await candidateRepository.findOne({
            where: {
                paper: req.paper,
                test_name: req.testName,
            },
        });
        if (!candidate) {
            ctx.status = 404;
            ctx.body = new responseClass_1.default(404, "候选人信息不存在", { status: false });
            return;
        }
        candidate.program_answer = req.code;
        candidate.program_language = req.language;
        candidate.submit_num += 1;
        await candidateRepository.save(candidate);
        ctx.status = 200;
        ctx.body = new responseClass_1.default(200, "提交成功", { status: true });
    }
    catch (error) {
        ctx.status = 500;
        ctx.body = new responseClass_1.default(500, "服务器错误", { status: false, error: error instanceof Error ? error.message : String(error) });
    }
};
//# sourceMappingURL=submit.js.map