import { Context } from 'koa'
import { getManager, getConnection } from "typeorm"
import { User } from '../entity/User';
import loginResponse from '../config/responseClass';

interface RequestBody {
  cookie?: string;
}

export default async (ctx: Context, next: any) => {
  // 若用户请求登录、注册、发送验证码或清理无效记录，则可以通过
  const dontNeedCheck = ['/api/login', '/api/register', '/api/email', '/api/test/cleanup'];
  if (dontNeedCheck.indexOf(ctx.url) > -1) {
    await next();
    return;
  }

  try {
    // 前端传过来的 cookie
    const requestBody = ctx.request.body as RequestBody;
    const cookie = requestBody.cookie || ctx.cookies.get('session');
    console.log('验证请求:', { url: ctx.url, cookie: cookie?.substring(0, 5) + '...' });

    // 如果 cookie 存在，则根据此依据查找数据库中是否有用户的 session 与该 cookie 相等，若查找成功则说明该用户已登录，可以访问非登录页之外的其他页面
    if (cookie) {
      // 使用默认连接
      const userRepository = getConnection().getRepository(User);
      // 根据 cookie 查看数据库中是否有 session 随机数
      const saveUser = await userRepository.findOne({ where: { session: cookie } });
      if (saveUser) {
        console.log('验证成功:', { email: saveUser.email });
        await next();
        return;
      } else {
        console.log('验证失败: session不存在');
      }
    } else {
      console.log('验证失败: 没有提供cookie');
    }

    ctx.body = new loginResponse(401, '您还未登录！如果您已注册，请先前往登录；如果还未注册，请先注册。');
  } catch (error) {
    console.error('验证出错:', error);
    ctx.body = new loginResponse(500, '服务器错误', {
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
};