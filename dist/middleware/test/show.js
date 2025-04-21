"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const Test_1 = require("../../entity/Test");
const TestPaper_1 = require("../../entity/TestPaper");
const responseClass_1 = __importDefault(require("../../config/responseClass"));
exports.default = async (ctx) => {
    try {
        const { paper, cookie, test } = ctx.request.body;
        const testRepository = (0, typeorm_1.getRepository)(Test_1.Test);
        const paperRepository = (0, typeorm_1.getRepository)(TestPaper_1.TestPaper);
        const paperEntity = await paperRepository.findOne({ where: { paper_name: paper } });
        if (!paperEntity) {
            ctx.status = 404;
            ctx.body = new responseClass_1.default(404, "试卷不存在", { status: false });
            return;
        }
        const testEntity = await testRepository.findOne({
            where: {
                paper: paperEntity,
                test_name: test,
            },
        });
        if (!testEntity) {
            ctx.status = 404;
            ctx.body = new responseClass_1.default(404, "试题不存在", { status: false });
            return;
        }
        ctx.status = 200;
        ctx.body = new responseClass_1.default(200, "获取成功", { status: true, data: testEntity });
    }
    catch (error) {
        ctx.status = 500;
        ctx.body = new responseClass_1.default(500, "服务器错误", { status: false, error: error instanceof Error ? error.message : String(error) });
    }
};
//# sourceMappingURL=show.js.map