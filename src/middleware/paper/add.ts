import { Context } from 'koa';
import { getManager, getConnection } from "typeorm";
import { nowTime } from '../../config/utils';
import { TestPaper } from '../../entity/TestPaper';
import { User } from '../../entity/User';
import nodemail from '../../../sendEmail.js';
import responseClass from '../../config/responseClass';

interface AddPaperRequest {
  values: {
    paper: string;
    paperDescription: string;
    candidate: string[];
    check: boolean;
    timeBegin: string;
    timeEnd: string;
    answerTime: number;
  };
  cookie: string;
}

export default async (ctx: Context) => {
  try {
    const { values, cookie } = ctx.request.body as AddPaperRequest;
    console.log('添加试卷请求:', {
      paper: values.paper,
      candidates: values.candidate,
      answerTime: values.answerTime
    });

    // 使用默认连接
    const userRepository = getConnection().getRepository(User);
    const saveUsers = await userRepository.findOne({ where: { session: cookie } });

    if (!saveUsers) {
      console.log('用户未找到:', { cookie });
      ctx.body = new responseClass(400, '用户未找到', { status: false });
      return;
    }

    const interviewerEmail = saveUsers.email;
    console.log('面试官:', { email: interviewerEmail });

    // 使用默认连接
    const paperRepository = getConnection().getRepository(TestPaper);
    const findPaper = await paperRepository.findOne({ where: { paper_name: values.paper } });

    // 根据候选人邮箱发送邮件通知
    if (values.candidate && values.candidate.length > 0) {
      console.log('将发送邮件给候选人:', values.candidate);
      for (let ret of values.candidate) {
        const mail = {
          from: '1164939253@qq.com',
          to: ret,
          subject: '在线编程笔试平台',
          text: '您收到一位面试官的邀请，可进入该网站 http://www.syandeg.com 查看试卷并填写!'
        };
        // 暂时注释发送邮件功能
        // nodemail(mail);
      }
    }

    // 查看该试卷是否已经存在于数据库中
    if (!findPaper) {
      const timeBegin = new Date(values.timeBegin).getTime();
      const timeEnd = new Date(values.timeEnd).getTime();
      const nowtime = new Date().getTime();

      console.log('创建新试卷:', {
        paper: values.paper,
        timeBegin: new Date(timeBegin).toISOString(),
        timeEnd: new Date(timeEnd).toISOString(),
        answerTime: values.answerTime
      });

      const newPaper = new TestPaper();
      newPaper.interviewer = interviewerEmail;
      newPaper.paper_name = values.paper;
      newPaper.description = values.paperDescription;
      newPaper.candidate = values.candidate ? values.candidate.join(',') : '';
      newPaper.time_begin = timeBegin;
      newPaper.time_end = timeEnd;
      newPaper.remaining_time = nowtime >= timeBegin && nowtime <= timeEnd;
      newPaper.answer_time = values.answerTime || 60; // 设置答题时间，默认60分钟

      await paperRepository.save(newPaper);
      console.log('试卷创建成功:', { key: newPaper.key, paper: newPaper.paper_name });
      ctx.body = new responseClass(200, '试卷新建成功，并已通知候选人', { status: true });
    } else {
      console.log('试卷已存在:', { paper: values.paper });
      ctx.body = new responseClass(200, '该试卷已存在，请新建试卷', { status: false });
    }
  } catch (error) {
    console.error('添加试卷出错:', error);
    ctx.body = new responseClass(500, '服务器错误', {
      status: false,
      error: error instanceof Error ? error.message : String(error)
    });
  }
}