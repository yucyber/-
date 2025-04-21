import { Context } from "koa";
import { getConnection } from "typeorm";
import { TestPaper } from "../../entity/TestPaper";
import { Test } from "../../entity/Test";
import { Candidate } from "../../entity/Candidate";
import { User } from '../../entity/User';
import responseClass from '../../config/responseClass';

interface DeleteRequest {
  paper: string;
  cookie: string;
}

export default async (ctx: Context) => {
  try {
    const { paper, cookie } = ctx.request.body as DeleteRequest;
    console.log('删除试卷请求:', { paper, cookie: cookie?.substring(0, 5) + '...' });

    // 验证用户权限
    const userRepository = getConnection().getRepository(User);
    const user = await userRepository.findOne({ where: { session: cookie } });

    if (!user || !user.interviewer) {
      console.log('无权限删除试卷:', { email: user?.email, isInterviewer: user?.interviewer });
      ctx.status = 403;
      ctx.body = new responseClass(403, "无权限删除试卷", { status: false });
      return;
    }

    const paperRepository = getConnection().getRepository(TestPaper);
    const testRepository = getConnection().getRepository(Test);
    const candidateRepository = getConnection().getRepository(Candidate);

    const paperEntity = await paperRepository.findOne({
      where: { paper_name: paper },
      relations: ["tests"],
    });

    if (!paperEntity) {
      console.log('试卷不存在:', { paper });
      ctx.status = 404;
      ctx.body = new responseClass(404, "试卷不存在", { status: false });
      return;
    }

    // 检查是否是试卷的创建者
    if (paperEntity.interviewer !== user.email) {
      console.log('非试卷创建者:', { paperCreator: paperEntity.interviewer, requester: user.email });
      ctx.status = 403;
      ctx.body = new responseClass(403, "只有试卷创建者才能删除试卷", { status: false });
      return;
    }

    // 删除相关的试题
    if (paperEntity.tests && paperEntity.tests.length > 0) {
      console.log(`删除${paperEntity.tests.length}个相关试题`);
      await testRepository.remove(paperEntity.tests);
    }

    // 删除相关的候选人信息
    const candidates = await candidateRepository.find({
      where: { paper },
    });

    if (candidates && candidates.length > 0) {
      console.log(`删除${candidates.length}个相关候选人记录`);
      await candidateRepository.remove(candidates);
    }

    // 删除试卷
    await paperRepository.remove(paperEntity);
    console.log('试卷删除成功:', { paper: paperEntity.paper_name });

    ctx.status = 200;
    ctx.body = new responseClass(200, "删除成功", { status: true });
  } catch (error) {
    console.error('删除试卷出错:', error);
    ctx.status = 500;
    ctx.body = new responseClass(500, "服务器错误", { status: false, error: error instanceof Error ? error.message : String(error) });
  }
};