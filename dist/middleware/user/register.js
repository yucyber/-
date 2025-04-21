"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const User_1 = __importDefault(require("../../entity/User"));
const responseClass_1 = __importDefault(require("../../config/responseClass"));
const utils_1 = require("../../config/utils");
exports.default = async (ctx) => {
    const { email, cypher, account, password, identity } = ctx.request.body;
    const userRepository = (0, typeorm_1.getConnection)('alimydb').getRepository(User_1.default);
    const saveUsers = await userRepository.findOne({ where: { email } });
    if (!saveUsers) {
        // 直接创建新用户
        const newUser = new User_1.default();
        newUser.email = email;
        newUser.cypher = cypher;
        newUser.account = account;
        newUser.password = password;
        newUser.interviewer = identity;
        // 生成session
        const session = (0, utils_1.generateMixed)(20);
        newUser.session = session;
        await userRepository.save(newUser);
        // 设置cookie
        ctx.cookies.set('session', session, { httpOnly: false, maxAge: 3600000 });
        ctx.body = new responseClass_1.default(200, '注册成功', {
            isLogin: true,
            interviewer: identity,
            session: session
        });
    }
    else {
        ctx.body = new responseClass_1.default(200, '该邮箱已被注册', {
            isLogin: false
        });
    }
};
//# sourceMappingURL=register.js.map