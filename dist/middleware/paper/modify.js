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
        const req = ctx.request.body;
        const testRepository = (0, typeorm_1.getRepository)(Test_1.Test);
        const testPaperRepository = (0, typeorm_1.getRepository)(TestPaper_1.TestPaper);
        const modifyPaper = await testPaperRepository.findOne({
            where: { paper_name: req.oldPaper },
            relations: ["tests"],
        });
        if (!modifyPaper) {
            ctx.status = 404;
            ctx.body = new responseClass_1.default(404, "试卷不存在", { status: false });
            return;
        }
        // 删除原有的试题
        if (modifyPaper.tests && modifyPaper.tests.length > 0) {
            await testRepository.remove(modifyPaper.tests);
        }
        // 添加新的试题
        let paperPoint = 0;
        const newTests = [];
        for (const testData of req.modifyTests) {
            const newTest = new Test_1.Test();
            newTest.test_name = testData.test_name;
            newTest.test = testData.test;
            newTest.answer = testData.answer;
            newTest.tags = testData.tags;
            newTest.level = testData.level;
            newTest.point = testData.point;
            newTest.paper = modifyPaper;
            paperPoint += testData.point;
            newTests.push(newTest);
        }
        await testRepository.save(newTests);
        // 更新试卷信息
        modifyPaper.paper_name = req.oldPaper === req.paper ? req.oldPaper : req.paper;
        modifyPaper.description = req.paperDescription;
        modifyPaper.total_num = req.modifyTests.length;
        modifyPaper.total_point = paperPoint;
        modifyPaper.candidate = req.candidate;
        modifyPaper.remaining_time = req.check;
        modifyPaper.time_end = req.answerTime;
        await testPaperRepository.save(modifyPaper);
        ctx.status = 200;
        ctx.body = new responseClass_1.default(200, "修改成功", { status: true });
    }
    catch (error) {
        ctx.status = 500;
        ctx.body = new responseClass_1.default(500, "服务器错误", { status: false, error: error instanceof Error ? error.message : String(error) });
    }
};
//# sourceMappingURL=modify.js.map