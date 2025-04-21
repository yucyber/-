"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const User_1 = __importDefault(require("../../entity/User"));
const responseClass_1 = __importDefault(require("../../config/responseClass"));
exports.default = async (ctx) => {
    const { cookie } = ctx.request.body;
    const userRepository = (0, typeorm_1.getManager)().getRepository(User_1.default);
    const saveUsers = await userRepository.findOne({ where: { session: cookie } });
    if (saveUsers) {
        saveUsers.session = null;
        await userRepository.save(saveUsers);
        ctx.cookies.set('session', '', { maxAge: 0 });
        ctx.body = new responseClass_1.default(200, '退出登录成功', null);
    }
    else {
        ctx.body = new responseClass_1.default(200, '用户未登录', null);
    }
};
//# sourceMappingURL=logout.js.map