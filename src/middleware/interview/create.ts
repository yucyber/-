import { Context } from 'koa';
import { createInterviewLink, createSixNum, nowTime, } from '../../../src/config/utils';
import { getManager, getConnection, getRepository } from "typeorm";
import { Interview } from '../../entity/Interview';
import responseClass from '../../config/responseClass';
import { INTERVIEW_STATUS } from '../../config/const';

interface CreateRequest {
  inform: {
    interviewer: string[];
    candidate: string;
    interview_begin_time: number;
  };
}

export default async (ctx: Context) => {
  try {
    const { inform } = ctx.request.body as CreateRequest;

    const interviewRepository = getRepository(Interview);

    const newInterview = new Interview();
    const roomNum = createSixNum();

    newInterview.interviewer = inform.interviewer;
    newInterview.candidate = inform.candidate;
    newInterview.interview_room = roomNum;
    newInterview.interview_begin_time = inform.interview_begin_time;
    newInterview.interviewer_link = createInterviewLink({ interviewer: true, roomNum });
    newInterview.candidate_link = createInterviewLink({ interviewer: false, roomNum });
    newInterview.interview_status = INTERVIEW_STATUS.NO;
    newInterview.evaluation = "";
    newInterview.comment = "";

    await interviewRepository.save(newInterview);

    ctx.status = 200;
    ctx.body = new responseClass(200, "创建成功", { status: true, data: newInterview });
  } catch (error) {
    ctx.status = 500;
    ctx.body = new responseClass(500, "服务器错误", { status: false, error: error instanceof Error ? error.message : String(error) });
  }
};