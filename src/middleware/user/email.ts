import { Context } from 'koa';
import nodemail from '../../../sendEmail.js';
import { createSixNum } from '../../config/utils';
import { getManager, getConnection } from "typeorm";
import { User } from '../../entity/User';
import responseClass from '../../config/responseClass';

interface EmailRequest {
  email: string;
  cypher: string;
}

interface EmailError extends Error {
  message: string;
}

export default async (ctx: Context) => {
  try {
    const { email, cypher } = ctx.request.body as EmailRequest;
    const userRepository = getConnection('examydb').getRepository(User);
    const saveUsers = await userRepository.findOne({ where: { email, cypher } });

    if (saveUsers) {
      ctx.body = new responseClass(200, '该邮箱已注册，可直接登录', { status: false });
    } else {
      const code = createSixNum();
      const saveUser = await userRepository.findOne({ where: { email } }) as User;
      const nowtime = new Date().getTime();
      console.log('生成验证码:', code);

      const mail = {
        from: '1164939253@qq.com',
        to: email,
        subject: '您注册账号的验证码为',
        text: '您的验证码为' + code + ',有效期为五分钟!'
      };

      await nodemail(mail);
      console.log('邮件已发送');

      if (saveUser) {
        saveUser.captcha = code.toString();
        saveUser.nowtime_captcha = nowtime;
        await userRepository.save(saveUser);
      } else {
        const newUser = new User();
        newUser.email = email;
        newUser.captcha = code.toString();
        newUser.nowtime_captcha = nowtime;
        await userRepository.save(newUser);
      }

      ctx.body = new responseClass(200, '邮箱验证码已发送，请注意在有效期内输入', { status: true, captchaTime: nowtime });
    }
  } catch (err) {
    const emailError = err as EmailError;
    console.error('邮件发送错误:', emailError);
    ctx.status = 500;
    ctx.body = new responseClass(500, '邮件发送失败，请稍后重试', { status: false, error: emailError.message });
  }
}