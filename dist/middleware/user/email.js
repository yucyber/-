"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sendEmail_js_1 = __importDefault(require("../../../sendEmail.js"));
const utils_1 = require("../../config/utils");
const typeorm_1 = require("typeorm");
const User_1 = __importDefault(require("../../entity/User"));
const responseClass_1 = __importDefault(require("../../config/responseClass"));
exports.default = async (ctx) => {
    try {
        const { email, cypher } = ctx.request.body;
        const userRepository = (0, typeorm_1.getConnection)('alimydb').getRepository(User_1.default);
        const saveUsers = await userRepository.findOne({ where: { email, cypher } });
        if (saveUsers) {
            ctx.body = new responseClass_1.default(200, '该邮箱已注册，可直接登录', { status: false });
        }
        else {
            const code = (0, utils_1.createSixNum)();
            const saveUser = await userRepository.findOne({ where: { email } });
            const nowtime = new Date().getTime();
            console.log('生成验证码:', code);
            const mail = {
                from: '1164939253@qq.com',
                to: email,
                subject: '您注册账号的验证码为',
                text: '您的验证码为' + code + ',有效期为五分钟!'
            };
            await (0, sendEmail_js_1.default)(mail);
            console.log('邮件已发送');
            if (saveUser) {
                saveUser.captcha = code;
                saveUser.nowtime_captcha = nowtime;
                await userRepository.save(saveUser);
            }
            else {
                const newUser = new User_1.default();
                newUser.email = email;
                newUser.captcha = code;
                newUser.nowtime_captcha = nowtime;
                await userRepository.save(newUser);
            }
            ctx.body = new responseClass_1.default(200, '邮箱验证码已发送，请注意在有效期内输入', { status: true, captchaTime: nowtime });
        }
    }
    catch (err) {
        const emailError = err;
        console.error('邮件发送错误:', emailError);
        ctx.status = 500;
        ctx.body = new responseClass_1.default(500, '邮件发送失败，请稍后重试', { status: false, error: emailError.message });
    }
};
//# sourceMappingURL=email.js.map