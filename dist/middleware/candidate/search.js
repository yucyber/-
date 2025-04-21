"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const Candidate_1 = __importDefault(require("../../entity/Candidate"));
const User_1 = __importDefault(require("../../entity/User"));
const responseClass_1 = __importDefault(require("../../config/responseClass"));
const Test_1 = require("../../entity/Test");
const TestPaper_1 = require("../../entity/TestPaper");
const beautify = require('js-beautify').js;
exports.default = async (ctx) => {
    try {
        const { paper, cookie, reqEmail } = ctx.request.body;
        const candidateRepository = (0, typeorm_1.getRepository)(Candidate_1.default);
        const userRepository = (0, typeorm_1.getManager)().getRepository(User_1.default);
        const userInform = await userRepository.findOne({ where: { session: cookie } });
        let email = userInform ? userInform.email : undefined;
        let msg = '';
        let ret = null;
        // 候选人模块首页要查询该用户所有的试卷信息，以及搜索试卷时会根据条件筛选试卷
        if ((paper && cookie) || (paper && reqEmail)) {
            if (reqEmail) {
                email = reqEmail;
            }
            ret = await candidateRepository.find({ where: { email, paper } });
            msg = '指定试卷信息已查找完毕';
        }
        else if (paper) {
            ret = await candidateRepository.find({ paper });
            msg = '试卷获取完毕';
        }
        else if (cookie) {
            ret = await candidateRepository.find({ email });
            msg = '该候选人的所有试卷信息获取成功';
        }
        else {
            // 若前端请求不携带任何参数，则是请求获取所有候选人的试卷信息
            ret = await candidateRepository.find();
            msg = '所有候选人的试卷信息获取成功';
        }
        const testRepository = (0, typeorm_1.getRepository)(Test_1.Test);
        const paperRepository = (0, typeorm_1.getRepository)(TestPaper_1.TestPaper);
        const paperEntity = await paperRepository.findOne({
            where: { paper_name: paper },
            relations: ["tests"],
        });
        if (!paperEntity) {
            ctx.status = 404;
            ctx.body = new responseClass_1.default(404, "试卷不存在", { status: false });
            return;
        }
        ctx.status = 200;
        ctx.body = new responseClass_1.default(200, "获取成功", { status: true, data: paperEntity.tests });
    }
    catch (error) {
        ctx.status = 500;
        ctx.body = new responseClass_1.default(500, "服务器错误", { status: false, error: error instanceof Error ? error.message : String(error) });
    }
};
//# sourceMappingURL=search.js.map