"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const utils_1 = require("../../config/utils");
const User_1 = __importDefault(require("../../entity/User"));
const responseClass_1 = __importDefault(require("../../config/responseClass"));
exports.default = async (ctx, next) => {
    const { email, cypher, account, password, cookie } = ctx.request.body;
    const userRepository = (0, typeorm_1.getConnection)('alimydb').getRepository(User_1.default);
    const saveUsers = await userRepository.findOne({ where: { email: email } });
    const data = { isLogin: false, interviewer: null, session: null };
    if ((!saveUsers || !saveUsers.cypher) && !cookie) {
        ctx.body = new responseClass_1.default(200, '你还未注册，请先注册', data);
    }
    else if (saveUsers && !cookie) {
        if (cypher === saveUsers.cypher && password === saveUsers.password) {
            // 设置20位数的 session 随机数，同时和查找到的用户信息一并存进数据库中
            const session = (0, utils_1.generateMixed)(20);
            saveUsers.session = session;
            await userRepository.save(saveUsers);
            // 设置cookie
            ctx.cookies.set('session', session, { httpOnly: false, maxAge: 3600000 });
            data.isLogin = true;
            data.interviewer = saveUsers.interviewer;
            data.session = session;
            ctx.body = new responseClass_1.default(200, '登录成功', data);
        }
        else {
            ctx.body = new responseClass_1.default(200, '邮箱账号或密码输入错误', data);
        }
    }
    else if (!saveUsers && cookie) {
        const findCookieUser = await userRepository.findOne({ where: { session: cookie } });
        if (findCookieUser) {
            data.isLogin = true;
            data.interviewer = findCookieUser.interviewer;
            data.session = cookie;
            ctx.body = new responseClass_1.default(200, '你已处于登录状态', data);
        }
    }
};
//# sourceMappingURL=login.js.map