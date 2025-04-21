import { Context } from 'koa';
import { getConnection } from "typeorm";
import { User } from '../../entity/User';
import responseClass from '../../config/responseClass';
import { generateMixed } from '../../config/utils';

interface RegisterRequest {
  email: string;
  password: string;
  account?: string; // 可选账号字段
}

export default async (ctx: Context, next: any) => {
  try {
    const { email, password, account } = ctx.request.body as RegisterRequest;
    console.log('注册请求:', { email, account });

    // 使用默认连接
    const userRepository = getConnection().getRepository(User);

    // 检查邮箱是否已注册
    const existingUser = await userRepository.findOne({ where: { email } });
    if (existingUser) {
      console.log('邮箱已注册');
      ctx.body = new responseClass(200, '该邮箱已注册', { registered: true });
      return;
    }

    // 创建新用户
    const newUser = new User();
    newUser.email = email;
    newUser.password = password;
    newUser.account = account || email; // 使用提供的账号或邮箱作为默认账号
    newUser.interviewer = false;
    newUser.session = generateMixed(20);

    await userRepository.save(newUser);
    console.log('用户注册成功:', { id: newUser.id, email: newUser.email, account: newUser.account });

    // 设置cookie
    ctx.cookies.set('session', newUser.session, {
      httpOnly: false,
      maxAge: 3600000,
      sameSite: 'lax'
    });

    ctx.body = new responseClass(200, '注册成功', {
      registered: true,
      isLogin: true,
      interviewer: false,
      session: newUser.session
    });
  } catch (error) {
    console.error('注册出错:', error);
    ctx.body = new responseClass(500, '服务器错误', {
      registered: false,
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
}