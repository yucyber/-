"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const Test_1 = require("../../entity/Test");
const TestPaper_1 = require("../../entity/TestPaper");
const Candidate_1 = __importDefault(require("../../entity/Candidate"));
const responseClass_1 = __importDefault(require("../../config/responseClass"));
exports.default = async (ctx) => {
    try {
        const request = ctx.request.body;
        const paperName = request.paper;
        const req = request.data;
        let paperPoint = 0;
        const testRepository = (0, typeorm_1.getConnection)('examydb').getRepository(Test_1.Test);
        const testPaperRepository = (0, typeorm_1.getConnection)('examydb').getRepository(TestPaper_1.TestPaper);
        const candidateRepository = (0, typeorm_1.getConnection)('alimydb').getRepository(Candidate_1.default);
        const testPaper = await testPaperRepository.findOne({ where: { paper_name: paperName } });
        if (!testPaper) {
            ctx.status = 404;
            ctx.body = new responseClass_1.default(404, "试卷不存在", { status: false });
            return;
        }
        if (request.candidateEmail) {
            for (let ch of request.candidateEmail) {
                const candidate = await candidateRepository.findOne({
                    where: {
                        email: ch,
                        paper: paperName,
                    },
                });
                if (!candidate) {
                    const newCandidate = new Candidate_1.default();
                    newCandidate.email = ch;
                    newCandidate.paper = request.paper;
                    newCandidate.watch = request.watch || false;
                    await candidateRepository.save(newCandidate);
                }
            }
        }
        let testNum = 1;
        for (let ch of req) {
            const newTest = new Test_1.Test();
            newTest.num = String(testNum++);
            newTest.test_name = ch.test_name;
            newTest.test = ch.test;
            newTest.answer = ch.answer;
            newTest.tags = ch.tags;
            newTest.level = ch.level;
            newTest.point = ch.point;
            newTest.paper = testPaper;
            paperPoint += ch.point;
            await testRepository.save(newTest);
        }
        testPaper.total_num = req.length;
        testPaper.total_point = paperPoint;
        await testPaperRepository.save(testPaper);
        ctx.status = 200;
        ctx.body = new responseClass_1.default(200, "添加成功", { status: true });
    }
    catch (error) {
        ctx.status = 500;
        ctx.body = new responseClass_1.default(500, "服务器错误", { status: false, error: error instanceof Error ? error.message : String(error) });
    }
};
//# sourceMappingURL=add.js.map