"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const User_1 = __importDefault(require("../entity/User"));
const responseClass_1 = __importDefault(require("../config/responseClass"));
exports.default = async (ctx, next) => {
    // 若用户请求登录或注册，则可以通过
    const dontNeedCheck = ['/api/login', '/api/register', '/api/email'];
    if (dontNeedCheck.indexOf(ctx.url) > -1) {
        await next();
        return;
    }
    // 前端传过来的 cookie
    const requestBody = ctx.request.body;
    const cookie = requestBody.cookie || ctx.cookies.get('session');
    // 如果 cookie 存在，则根据此依据查找数据库中是否有用户的 session 与该 cookie 相等，若查找成功则说明该用户已登录，可以访问非登录页之外的其他页面
    if (cookie) {
        const userRepository = (0, typeorm_1.getConnection)('alimydb').getRepository(User_1.default);
        // 根据 cookie 查看数据库中是否有 session 随机数
        const saveUser = await userRepository.findOne({ where: { session: cookie } });
        if (saveUser) {
            await next();
            return;
        }
    }
    ctx.body = new responseClass_1.default(200, '您还未登录！如果您已注册，请先前往登录；如果还未注册，请先注册。');
};
//# sourceMappingURL=authenticate.js.map