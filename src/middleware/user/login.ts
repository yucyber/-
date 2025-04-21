import { Context } from 'koa';
import { getManager, getConnection } from "typeorm";
import { generateMixed } from '../../config/utils';
import { User } from '../../entity/User';
import responseClass from '../../config/responseClass';

interface LoginRequest {
  email: string;
  password: string;
  cookie?: string;
  account?: string;  // 添加可选的account字段
}

export default async (ctx: Context, next: any) => {
  try {
    const { email, password, cookie, account } = ctx.request.body as LoginRequest;
    console.log('登录请求:', { email, account, cookie: !!cookie });

    // 修改为使用默认连接
    const userRepository = getConnection().getRepository(User);

    const data = { isLogin: false, interviewer: null, session: null };

    // 处理Cookie登录
    if (cookie) {
      console.log('尝试使用cookie登录:', cookie);
      const userWithSession = await userRepository.findOne({
        where: { session: cookie },
        select: ['email', 'interviewer', 'session']
      });

      if (userWithSession) {
        console.log('Cookie登录成功');
        data.isLogin = true;
        data.interviewer = userWithSession.interviewer;
        data.session = userWithSession.session;
        ctx.body = new responseClass(200, '登录成功', data);
        return;
      } else {
        console.log('Cookie失效');
        ctx.body = new responseClass(200, 'cookie已失效，请重新登录', data);
        return;
      }
    }

    // 密码登录
    if (email && password) {
      console.log('尝试使用密码登录:', email);
      const saveUsers = await userRepository.findOne({
        where: { email },
        select: ['email', 'password', 'interviewer', 'session', 'account']
      });

      console.log('查询到的用户:', saveUsers);

      if (!saveUsers) {
        console.log('用户未注册');
        ctx.body = new responseClass(200, '你还未注册，请先注册', data);
        return;
      }

      if (password === saveUsers.password) {
        // 生成新的session
        const session = generateMixed(20);
        saveUsers.session = session;
        await userRepository.save(saveUsers);
        console.log('密码登录成功，设置新session:', session);

        // 设置cookie
        ctx.cookies.set('session', session, {
          httpOnly: false,
          maxAge: 3600000,
          sameSite: 'lax'
        });

        data.isLogin = true;
        data.interviewer = saveUsers.interviewer;
        data.session = session;
        ctx.body = new responseClass(200, '登录成功', data);
      } else {
        console.log('密码错误');
        ctx.body = new responseClass(200, '邮箱或密码输入错误', data);
      }
      return;
    }

    // 如果没有提供登录凭据
    ctx.body = new responseClass(400, '请提供邮箱和密码', data);
  } catch (error) {
    console.error('登录出错:', error);
    ctx.body = new responseClass(500, '服务器错误', {
      isLogin: false,
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
}