"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const User_1 = __importDefault(require("../../../src/entity/User"));
const TestPaper_1 = __importDefault(require("../../entity/TestPaper"));
const responseClass_1 = __importDefault(require("../../config/responseClass"));
exports.default = async (ctx) => {
    const { paper, cookie, interviewer } = ctx.request.body;
    const paperRepository = (0, typeorm_1.getConnection)('examydb').getRepository(TestPaper_1.default);
    const userRepository = (0, typeorm_1.getConnection)('alimydb').getRepository(User_1.default);
    let show = null;
    if (paper) {
        show = await paperRepository.findOne({ where: { paper_name: paper } });
        ctx.body = new responseClass_1.default(200, '单独的试卷信息获取成功', show);
        return;
    }
    else if (cookie) {
        const user = await userRepository.findOne({ where: { session: cookie } });
        if (!user) {
            ctx.body = new responseClass_1.default(400, '用户未找到', null);
            return;
        }
        const findEmail = user.email;
        if (interviewer) {
            show = await paperRepository.createQueryBuilder('paper')
                .where('paper.interviewer = :interviewer', { interviewer: findEmail })
                .getMany();
        }
        else {
            show = await paperRepository.createQueryBuilder('paper')
                .where('paper.candidate LIKE :email', { email: `%${findEmail}%` })
                .getMany();
        }
    }
    else {
        show = await paperRepository.find();
    }
    if (Array.isArray(show)) {
        show = await Promise.all(show.map(async (item) => {
            const nowtime = new Date().getTime();
            const timeBegin = item.time_begin ? Number(item.time_begin) : 0;
            const timeEnd = item.time_end ? Number(item.time_end) : 0;
            return Object.assign(Object.assign({}, item), { remaining_time: nowtime >= timeBegin && nowtime <= timeEnd });
        }));
    }
    ctx.body = new responseClass_1.default(200, '请求成功', { show });
};
//# sourceMappingURL=show.js.map