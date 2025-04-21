import { Context } from 'koa';
import { getRepository, getManager, Like, getConnection } from "typeorm";
import { User, TestPaper, LookOver } from '../../entity';
import responseClass from '../../config/responseClass';
import { transTime } from '../../config/utils';

interface ShowPaperRequest {
  paper?: string;
  cookie?: string;
  interviewer?: boolean;
}

export default async (ctx: Context) => {
  try {
    const { paper, cookie, interviewer } = ctx.request.body as ShowPaperRequest;
    console.log('显示试卷请求:', { paper, cookie: cookie?.substring(0, 5) + '...', interviewer });

    // 使用默认连接
    const paperRepository = getConnection().getRepository(TestPaper);
    const userRepository = getConnection().getRepository(User);
    let show = null;

    if (paper) {
      console.log('查询特定试卷:', { paper });
      show = await paperRepository.findOne({ where: { paper_name: paper } });
      if (!show) {
        console.log('试卷未找到:', { paper });
        ctx.body = new responseClass(404, '试卷未找到', null);
        return;
      }
      console.log('试卷查询成功:', { paper: show.paper_name });
      ctx.body = new responseClass(200, '单独的试卷信息获取成功', show);
      return;
    } else if (cookie) {
      const user = await userRepository.findOne({ where: { session: cookie } });
      if (!user) {
        console.log('用户未找到:', { cookie: cookie?.substring(0, 5) + '...' });
        ctx.body = new responseClass(400, '用户未找到', null);
        return;
      }
      const findEmail = user.email;
      console.log('查询用户试卷:', { email: findEmail, interviewer });

      if (interviewer) {
        show = await paperRepository.createQueryBuilder('paper')
          .where('paper.interviewer = :interviewer', { interviewer: findEmail })
          .getMany();
      } else {
        show = await paperRepository.createQueryBuilder('paper')
          .where('paper.candidate LIKE :email', { email: `%${findEmail}%` })
          .getMany();
      }
    } else {
      console.log('查询所有试卷');
      show = await paperRepository.find();
    }

    if (Array.isArray(show)) {
      show = await Promise.all(show.map(async (item) => {
        const nowtime = new Date().getTime();
        const timeBegin = item.time_begin ? Number(item.time_begin) : 0;
        const timeEnd = item.time_end ? Number(item.time_end) : 0;

        return {
          ...item,
          remaining_time: nowtime >= timeBegin && nowtime <= timeEnd
        };
      }));
      console.log(`查询结果: ${show.length}个试卷`);
    }

    ctx.body = new responseClass(200, '请求成功', { show });
  } catch (error) {
    console.error('显示试卷出错:', error);
    ctx.body = new responseClass(500, '服务器错误', {
      error: error instanceof Error ? error.message : String(error)
    });
  }
}