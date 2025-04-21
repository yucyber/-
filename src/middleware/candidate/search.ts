import { Context } from 'koa';
import { getManager, getConnection, getRepository, Like } from "typeorm";
import { Candidate } from '../../entity/Candidate';
import { User } from '../../entity/User';
import responseClass from '../../config/responseClass';
import { Test } from "../../entity/Test";
import { TestPaper } from "../../entity/TestPaper";
const beautify = require('js-beautify').js;

interface SearchRequest {
  paper: string;
  cookie: string;
  reqEmail: string;
}

export default async (ctx: Context) => {
  try {
    const { paper, cookie, reqEmail } = ctx.request.body as SearchRequest;
    const candidateRepository = getRepository(Candidate);
    const userRepository = getManager().getRepository(User);
    const userInform = await userRepository.findOne({ where: { session: cookie } });
    let email = userInform ? userInform.email : undefined;

    let msg: string = '';
    let ret = null;
    // 候选人模块首页要查询该用户所有的试卷信息，以及搜索试卷时会根据条件筛选试卷
    if ((paper && cookie) || (paper && reqEmail)) {
      if (reqEmail) {
        email = reqEmail;
      }
      ret = await candidateRepository.find({ where: { email, paper } });
      msg = '指定试卷信息已查找完毕';
    } else if (paper) {
      ret = await candidateRepository.find({ paper });
      msg = '试卷获取完毕';
    } else if (cookie) {
      ret = await candidateRepository.find({ email });
      msg = '该候选人的所有试卷信息获取成功';
    } else {
      // 若前端请求不携带任何参数，则是请求获取所有候选人的试卷信息
      ret = await candidateRepository.find();
      msg = '所有候选人的试卷信息获取成功';
    }

    const testRepository = getRepository(Test);
    const paperRepository = getRepository(TestPaper);

    const paperEntity = await paperRepository.findOne({
      where: { paper_name: paper },
      relations: ["tests"],
    });

    if (!paperEntity) {
      ctx.status = 404;
      ctx.body = new responseClass(404, "试卷不存在", { status: false });
      return;
    }

    ctx.status = 200;
    ctx.body = new responseClass(200, "获取成功", { status: true, data: paperEntity.tests });
  } catch (error) {
    ctx.status = 500;
    ctx.body = new responseClass(500, "服务器错误", { status: false, error: error instanceof Error ? error.message : String(error) });
  }
};