import { Context } from 'koa';
import { getManager, getConnection } from "typeorm";
import { User } from '../../entity/User';
import responseClass from '../../config/responseClass';

interface SearchEmailRequest {
  cookie?: string;
  interviewer?: boolean;
}

export default async (ctx: Context) => {
  const { cookie, interviewer } = ctx.request.body as SearchEmailRequest;
  const userRepository = getConnection('examydb').getRepository(User);

  if (cookie) {
    const ret = await userRepository.findOne({ where: { session: cookie } });
    if (!ret) {
      ctx.body = new responseClass(200, '用户未登录', { identity: null });
      return;
    }
    const identity = ret.interviewer === true ? '面试官' : '候选人';
    ctx.body = new responseClass(200, '当前用户信息获取成功', {
      identity,
      email: ret.email
    });
  } else if (interviewer === false) {
    const ret = await userRepository.find({ where: { interviewer: false } });
    ctx.body = new responseClass(200, '候选人邮箱获取成功', { ret });
  } else if (interviewer === true) {
    const ret = await userRepository.find({ where: { interviewer: true } });
    ctx.body = new responseClass(200, '面试官邮箱获取成功', { ret });
  } else {
    const ret = await userRepository.find();
    ctx.body = new responseClass(200, '所有用户信息获取成功', { ret });
  }
}