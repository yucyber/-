"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const LookOver_1 = __importDefault(require("../../entity/LookOver"));
const responseClass_1 = __importDefault(require("../../config/responseClass"));
const Candidate_1 = __importDefault(require("../../../src/entity/Candidate"));
const TestPaper_1 = __importDefault(require("../../../src/entity/TestPaper"));
exports.default = async (ctx) => {
    try {
        const { paper, cookie, email } = ctx.request.body;
        const paperRepository = (0, typeorm_1.getRepository)(TestPaper_1.default);
        const candidateRepository = (0, typeorm_1.getRepository)(Candidate_1.default);
        const lookOverRepository = (0, typeorm_1.getRepository)(LookOver_1.default);
        const paperEntity = await paperRepository.findOne({
            where: { paper_name: paper },
        });
        if (!paperEntity) {
            ctx.status = 404;
            ctx.body = new responseClass_1.default(404, "试卷不存在", { status: false });
            return;
        }
        const candidates = await candidateRepository.find({
            where: { paper, email },
        });
        if (!candidates || candidates.length === 0) {
            ctx.status = 404;
            ctx.body = new responseClass_1.default(404, "候选人信息不存在", { status: false });
            return;
        }
        const lookOver = await lookOverRepository.findOne({
            where: { email, paper },
        });
        if (!lookOver) {
            const newLookOver = new LookOver_1.default();
            newLookOver.email = email;
            newLookOver.paper = paper;
            newLookOver.join = true;
            await lookOverRepository.save(newLookOver);
        }
        ctx.status = 200;
        ctx.body = new responseClass_1.default(200, "获取成功", {
            status: true,
            data: {
                candidates,
                lookOver,
            }
        });
    }
    catch (error) {
        ctx.status = 500;
        ctx.body = new responseClass_1.default(500, "服务器错误", { status: false, error: error instanceof Error ? error.message : String(error) });
    }
};
//# sourceMappingURL=lookOver.js.map