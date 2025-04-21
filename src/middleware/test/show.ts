import { Context } from "koa";
import { getConnection } from "typeorm";
import { Test } from "../../entity/Test";
import { TestPaper } from "../../entity/TestPaper";
import { User } from "../../entity/User";
import responseClass from '../../config/responseClass';

interface ShowTestRequest {
  paper: string;
  cookie: string;
  test?: string;
}

export default async (ctx: Context) => {
  try {
    const { paper, cookie, test } = ctx.request.body as ShowTestRequest;
    console.log('显示题目请求:', { paper, test, cookie: cookie?.substring(0, 5) + '...' });

    // 获取用户信息
    const userRepository = getConnection().getRepository(User);
    const user = await userRepository.findOne({ where: { session: cookie } });

    if (!user) {
      console.log('用户未找到');
      ctx.body = new responseClass(401, '您还未登录！如果您已注册，请先前往登录；如果还未注册，请先注册。');
      return;
    }

    const testRepository = getConnection().getRepository(Test);
    const paperRepository = getConnection().getRepository(TestPaper);

    console.log('查询试卷:', { paperName: paper });
    const paperEntity = await paperRepository
      .createQueryBuilder('paper')
      .where('paper.paper_name = :paperName', { paperName: paper })
      .leftJoinAndSelect('paper.tests', 'test')
      .orderBy('test.num', 'ASC')
      .getOne();

    if (!paperEntity) {
      console.log('试卷不存在:', { paper });
      ctx.body = new responseClass(404, '试卷不存在');
      return;
    }

    // 检查用户是否有权限访问该试卷
    const candidates = paperEntity.candidate ? paperEntity.candidate.split(',').filter(Boolean) : [];
    console.log('当前用户:', user.email);
    console.log('候选人:', candidates);
    console.log('是否面试官:', user.interviewer);

    if (!user.interviewer && !candidates.includes(user.email)) {
      console.log('无权访问试卷');
      ctx.status = 403;
      ctx.body = new responseClass(403, "无权访问此试卷", { status: false });
      return;
    }

    // 不需要手动转换UTF-8编码，TypeORM会自动处理
    if (test) {
      // 获取单个题目
      console.log('查询单个题目:', { test });
      const testEntity = await testRepository.findOne({
        where: {
          paperKey: paperEntity.key,
          test_name: test,
        },
      });

      if (!testEntity) {
        console.log('题目不存在');
        ctx.status = 404;
        ctx.body = new responseClass(404, "试题不存在", { status: false });
        return;
      }

      console.log('题目查询成功');
      ctx.status = 200;
      ctx.body = new responseClass(200, "获取成功", { status: true, data: testEntity });
    } else {
      // 获取试卷所有题目
      console.log('查询试卷所有题目');
      const tests = await testRepository
        .createQueryBuilder('test')
        .where('test.paperKey = :paperKey', { paperKey: paperEntity.key })
        .select([
          'test.key',
          'test.num',
          'test.test_name',
          'test.test',
          'test.paperKey',
          'test.answer',
          'test.tags',
          'test.level',
          'test.point',
          'test.testCases',
          'test.template'
        ])
        .orderBy('test.num', 'ASC')
        .getMany();

      console.log(`查询到${tests.length}个题目`);
      ctx.status = 200;
      ctx.body = new responseClass(200, "获取成功", {
        status: true,
        data: {
          ...paperEntity,
          tests: tests
        }
      });
    }
  } catch (error) {
    console.error('获取试卷信息时出错:', error);
    ctx.body = new responseClass(500, '服务器错误', {
      status: false,
      error: error instanceof Error ? error.message : String(error)
    });
  }
};