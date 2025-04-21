import { Context } from "koa";
import { getManager, getConnection, getRepository } from "typeorm";
import { Interview } from "../../entity/Interview";
import responseClass from '../../config/responseClass';

interface DeleteRequest {
  inform: {
    id: number;
  };
}

export default async (ctx: Context) => {
  try {
    const { inform } = ctx.request.body as DeleteRequest;

    const interviewRepository = getRepository(Interview);

    const interview = await interviewRepository.findOne({
      where: { id: inform.id },
    });

    if (!interview) {
      ctx.status = 404;
      ctx.body = new responseClass(404, "面试记录不存在", { status: false });
      return;
    }

    await interviewRepository.remove(interview);

    ctx.status = 200;
    ctx.body = new responseClass(200, "删除成功", { status: true });
  } catch (error) {
    ctx.status = 500;
    ctx.body = new responseClass(500, "服务器错误", { status: false, error: error instanceof Error ? error.message : String(error) });
  }
};