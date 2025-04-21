import { Context } from 'koa';
import { getRepository } from "typeorm";
import { Test } from "../../entity/Test";
import { TestPaper } from "../../entity/TestPaper";
import responseClass from '../../config/responseClass';
import { Candidate } from '../../../src/entity/Candidate';
import nodemail from '../../../sendEmail.js';

interface ModifyRequest {
  oldPaper: string;
  paper: string;
  paperDescription: string;
  modifyTests: Array<{
    test_name: string;
    test: string;
    answer: string;
    tags: string[];
    level: string;
    point: number;
  }>;
  candidate: string;
  check: boolean;
  answerTime: number;
}

export default async (ctx: Context) => {
  try {
    const req = ctx.request.body as ModifyRequest;

    const testRepository = getRepository(Test);
    const testPaperRepository = getRepository(TestPaper);

    const modifyPaper = await testPaperRepository.findOne({
      where: { paper_name: req.oldPaper },
      relations: ["tests"],
    });

    if (!modifyPaper) {
      ctx.status = 404;
      ctx.body = new responseClass(404, "试卷不存在", { status: false });
      return;
    }

    // 删除原有的试题
    if (modifyPaper.tests && modifyPaper.tests.length > 0) {
      await testRepository.remove(modifyPaper.tests);
    }

    // 添加新的试题
    let paperPoint = 0;
    const newTests = [];

    for (const testData of req.modifyTests) {
      const newTest = new Test();
      newTest.test_name = testData.test_name;
      newTest.test = testData.test;
      newTest.answer = testData.answer;
      newTest.tags = testData.tags;
      newTest.level = testData.level;
      newTest.point = testData.point;
      newTest.paper = modifyPaper;
      paperPoint += testData.point;
      newTests.push(newTest);
    }

    await testRepository.save(newTests);

    // 更新试卷信息
    modifyPaper.paper_name = req.oldPaper === req.paper ? req.oldPaper : req.paper;
    modifyPaper.description = req.paperDescription;
    modifyPaper.total_num = req.modifyTests.length;
    modifyPaper.total_point = paperPoint;
    modifyPaper.candidate = req.candidate;
    modifyPaper.remaining_time = req.check;
    modifyPaper.time_end = req.answerTime;

    await testPaperRepository.save(modifyPaper);

    ctx.status = 200;
    ctx.body = new responseClass(200, "修改成功", { status: true });
  } catch (error) {
    ctx.status = 500;
    ctx.body = new responseClass(500, "服务器错误", { status: false, error: error instanceof Error ? error.message : String(error) });
  }
};