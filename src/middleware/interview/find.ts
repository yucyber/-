import { Context } from 'koa';
import { getManager, getConnection } from "typeorm";
import { Interview } from '../../entity/Interview';
import { TestPaper } from '../../entity/TestPaper';
import { User } from '../../entity/User';
import responseClass from '../../config/responseClass';

interface FindRequest {
  interviewer?: string;
  findArr?: {
    interviewer: string;
    interview_room: string;
    interviewer_link: string;
  };
  cookie?: string;
  isInterviewer?: boolean;
}

export default async (ctx: Context) => {
  const { interviewer, findArr, cookie, isInterviewer } = ctx.request.body as FindRequest;
  const interviewRepository = getManager().getRepository(Interview);
  if (cookie) {
    const userRepository = getManager().getRepository(User);
    const user = await userRepository.findOne({ where: { session: cookie } });
    if (!user) {
      ctx.body = new responseClass(400, '用户未找到', { status: false });
      return;
    }
    const email = user.email;
    if (isInterviewer === true) {
      const findInterviewer = await interviewRepository.find({ where: { interviewer: [email] } });
      console.log('interviewer', findInterviewer);
      ctx.body = new responseClass(200, '该面试官所有面试间信息查找完毕', { ret: findInterviewer });
    } else {
      const findCandidate = await interviewRepository.find({ where: { candidate: email } });
      console.log('candidate', findCandidate);
      ctx.body = new responseClass(200, '该候选人所有面试间信息查找完毕', { ret: findCandidate });
    }
  } else if (interviewer) {
    const findInterviewInfrom = await interviewRepository.find({ where: { interviewer: [interviewer] } });
    ctx.body = new responseClass(200, '该面试官的面试间信息查询成功', { ret: findInterviewInfrom });
  } else if (findArr) {
    const { interviewer, interview_room, interviewer_link } = findArr;
    const findInterviewer = await interviewRepository.findOne({
      where: {
        interviewer: [interviewer],
        interview_room,
        interviewer_link
      }
    });
    if (findInterviewer) {
      ctx.body = new responseClass(200, '该面试官指定的面试间信息查找完毕', { status: true });
    } else {
      ctx.body = new responseClass(200, '该面试间不存在，请重新输入', { status: false });
    }
  }
}