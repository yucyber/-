import { Context } from 'koa';
import { getManager, getConnection } from "typeorm";
import { User } from '../../entity/User';
import responseClass from '../../config/responseClass';

interface LogoutRequest {
  cookie: string;
}

export default async (ctx: Context) => {
  const { cookie } = ctx.request.body as LogoutRequest;
  const userRepository = getManager().getRepository(User);
  const saveUsers = await userRepository.findOne({ where: { session: cookie } });

  if (saveUsers) {
    saveUsers.session = null;
    await userRepository.save(saveUsers);
    ctx.cookies.set('session', '', { maxAge: 0 });
    ctx.body = new responseClass(200, '退出登录成功', null);
  } else {
    ctx.body = new responseClass(200, '用户未登录', null);
  }
}