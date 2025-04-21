import { Context } from 'koa';
import { getManager, getConnection, getRepository } from "typeorm";
import { Candidate } from '../../entity/Candidate';
import { User } from '../../entity/User';
import { Test } from '../../entity/Test';
import { TestPaper } from '../../entity/TestPaper';
import { LookOver } from '../../entity/LookOver';
import responseClass from '../../config/responseClass';
import nodemail from '../../../sendEmail.js';
import { TEST_STATUS } from '../../config/const';
import { nowTime } from '../../config/utils';

interface SubmitRequest {
  paper: string;  // 试卷名称
  cookie: string; // 用户会话
  testKey?: number; // 题目的key
  answer: string;  // 用户提交的代码
  language?: string; // 编程语言
  // 旧的字段，保留向后兼容
  submit?: string;
  testName?: string;
  status?: boolean;
  code?: string;
}

export default async (ctx: Context) => {
  try {
    const req = ctx.request.body as SubmitRequest;
    console.log('提交答案请求:', {
      paper: req.paper,
      testKey: req.testKey,
      testName: req.testName,
      language: req.language,
      cookie: req.cookie?.substring(0, 5) + '...'
    });

    // 使用默认连接
    const connection = getConnection();
    const testRepository = connection.getRepository(Test);
    const paperRepository = connection.getRepository(TestPaper);
    const candidateRepository = connection.getRepository(Candidate);
    const userRepository = connection.getRepository(User);

    // 验证用户
    const user = await userRepository.findOne({ where: { session: req.cookie } });
    if (!user) {
      console.log('用户未登录');
      ctx.status = 401;
      ctx.body = new responseClass(401, '请先登录', { status: false });
      return;
    }
    console.log('用户已验证:', { email: user.email });

    // 处理可能的URL编码
    let paperName = req.paper;
    try {
      // 如果是数字(01)，保持原样；否则尝试解码
      if (!/^\d+$/.test(paperName)) {
        paperName = decodeURIComponent(paperName);
      }
      console.log('处理后的试卷名:', paperName);
    } catch (e) {
      console.log('解码试卷名失败，使用原始值:', req.paper);
    }

    // 查找试卷 - 使用模糊匹配
    console.log('查询试卷:', { paperName });
    let paperEntity = await paperRepository.findOne({
      where: { paper_name: paperName },
    });

    // 如果找不到，尝试用数字查找
    if (!paperEntity && /^\d+$/.test(paperName)) {
      console.log('尝试用数字查找试卷');
      const paperEntities = await paperRepository.find();
      paperEntity = paperEntities.find(p => p.paper_name === paperName ||
        p.paper_name === `试卷${paperName}` ||
        p.paper_name === `测试${paperName}`);
    }

    if (!paperEntity) {
      console.log('试卷不存在:', { paper: paperName });

      // 获取所有试卷以便调试
      const allPapers = await paperRepository.find();
      console.log('数据库中所有试卷:', allPapers.map(p => p.paper_name));

      ctx.status = 404;
      ctx.body = new responseClass(404, "试卷不存在", { status: false });
      return;
    }
    console.log('试卷已找到:', { key: paperEntity.key, paperName: paperEntity.paper_name });

    // 查找题目 - 优先使用testKey
    let testEntity;
    if (req.testKey) {
      console.log('使用testKey查询题目:', { testKey: req.testKey });
      testEntity = await testRepository.findOne({
        where: { key: req.testKey }
      });
    } else if (req.testName) {
      console.log('使用testName查询题目:', { testName: req.testName, paperKey: paperEntity.key });
      testEntity = await testRepository.findOne({
        where: {
          paperKey: paperEntity.key,
          test_name: req.testName,
        },
      });
    }

    if (!testEntity) {
      // 尝试查找所有题目
      const allTests = await testRepository.find({ where: { paperKey: paperEntity.key } });
      console.log('该试卷的所有题目:', allTests.map(t => `${t.key}: ${t.test_name}`));

      console.log('题目不存在');
      ctx.status = 404;
      ctx.body = new responseClass(404, "试题不存在", { status: false });
      return;
    }
    console.log('题目已找到:', { key: testEntity.key, testName: testEntity.test_name });

    // 查找或创建候选人记录
    let candidate = await candidateRepository.findOne({
      where: {
        paper: paperEntity.paper_name,
        test_name: testEntity.test_name,
        email: user.email
      },
    });

    if (!candidate) {
      console.log('创建新的候选人记录');
      candidate = new Candidate();
      candidate.paper = paperEntity.paper_name;
      candidate.test_name = testEntity.test_name;
      candidate.email = user.email;
      candidate.submit_num = 0;
    }

    // 更新候选人答案 - 使用新字段或旧字段
    candidate.program_answer = req.answer || req.code || '';
    candidate.program_language = req.language || 'java';
    candidate.submit_num += 1;
    candidate.submit_time = new Date();

    console.log('保存候选人答案记录');
    await candidateRepository.save(candidate);
    console.log('答案提交成功');

    ctx.status = 200;
    ctx.body = new responseClass(200, "提交成功", { status: true });
  } catch (error) {
    console.error('提交答案出错:', error);
    ctx.status = 500;
    ctx.body = new responseClass(500, "服务器错误", {
      status: false,
      error: error instanceof Error ? error.message : String(error)
    });
  }
};