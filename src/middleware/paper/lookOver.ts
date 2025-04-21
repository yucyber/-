import { Context } from 'koa';
import { getManager, getConnection, getRepository } from "typeorm";
import { nowTime } from '../../config/utils';
import { LookOver } from '../../entity/LookOver';
import { TestPaper } from '../../entity/TestPaper';
import { User } from '../../entity/User';
import { Candidate } from '../../entity/Candidate';
import responseClass from '../../config/responseClass';

interface LookOverRequest {
  paper: string;
  cookie: string;
  email: string;
}

export default async (ctx: Context) => {
  try {
    const { paper, cookie, email } = ctx.request.body as LookOverRequest;

    const paperRepository = getRepository(TestPaper);
    const candidateRepository = getRepository(Candidate);
    const lookOverRepository = getRepository(LookOver);

    const paperEntity = await paperRepository.findOne({
      where: { paper_name: paper },
    });

    if (!paperEntity) {
      ctx.status = 404;
      ctx.body = new responseClass(404, "试卷不存在", { status: false });
      return;
    }

    const candidates = await candidateRepository.find({
      where: { paper, email },
    });

    if (!candidates || candidates.length === 0) {
      ctx.status = 404;
      ctx.body = new responseClass(404, "候选人信息不存在", { status: false });
      return;
    }

    const lookOver = await lookOverRepository.findOne({
      where: { email, paper },
    });

    if (!lookOver) {
      const newLookOver = new LookOver();
      newLookOver.email = email;
      newLookOver.paper = paper;
      newLookOver.join = true;
      await lookOverRepository.save(newLookOver);
    }

    ctx.status = 200;
    ctx.body = new responseClass(200, "获取成功", {
      status: true,
      data: {
        candidates,
        lookOver,
      }
    });
  } catch (error) {
    ctx.status = 500;
    ctx.body = new responseClass(500, "服务器错误", { status: false, error: error instanceof Error ? error.message : String(error) });
  }
};