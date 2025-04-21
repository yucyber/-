import { Context } from 'koa';
import { getManager, getConnection } from "typeorm";
import { Interview } from '../../entity/Interview';
import responseClass from '../../config/responseClass';

interface SubmitRequest {
  evaluation: string;
  interview_id: string;
}

export default async (ctx: Context) => {
  try {
    const { evaluation, interview_id } = ctx.request.body as SubmitRequest;
    const interviewRepository = getConnection('examydb').getRepository(Interview);
    const saveInterview = await interviewRepository.findOne({ where: { interview_id } }) as Interview;

    if (!saveInterview) {
      ctx.body = new responseClass(404, '面试记录不存在');
      return;
    }

    saveInterview.evaluation = evaluation;
    await interviewRepository.save(saveInterview);

    ctx.body = new responseClass(200, '面试评价提交成功');
  } catch (err) {
    console.error('Error in interview submit:', err);
    ctx.body = new responseClass(500, '服务器错误', { error: err instanceof Error ? err.message : '未知错误' });
  }
};