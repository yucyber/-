import { Context } from 'koa';
import { getConnection } from "typeorm";
import { Test } from '../../entity/Test';
import { User } from '../../entity/User';
import responseClass from '../../config/responseClass';

interface UpdateTestCaseRequest {
    testKey: number;
    cookie: string;
    testCases?: {
        input: string[];
        output: string[];
    }[];
}

/**
 * 更新测试用例中间件
 * 允许查看和修改题目的测试用例
 */
export default async (ctx: Context) => {
    try {
        const { testKey, cookie, testCases } = ctx.request.body as UpdateTestCaseRequest;
        console.log('更新测试用例请求:', { testKey, cookie: cookie?.substring(0, 5) + '...', hasTestCases: !!testCases });

        // 获取用户信息
        const userRepository = getConnection().getRepository(User);
        const user = await userRepository.findOne({ where: { session: cookie } });

        if (!user) {
            console.log('用户未找到');
            ctx.status = 401;
            ctx.body = new responseClass(401, '请先登录', { status: false });
            return;
        }

        // 只允许面试官修改测试用例
        if (!user.interviewer) {
            console.log('非面试官尝试修改测试用例');
            ctx.status = 403;
            ctx.body = new responseClass(403, '只有面试官可以修改测试用例', { status: false });
            return;
        }

        // 获取测试题目
        const testRepository = getConnection().getRepository(Test);
        const test = await testRepository.findOne({ where: { key: testKey } });

        if (!test) {
            console.log('题目不存在');
            ctx.status = 404;
            ctx.body = new responseClass(404, '题目不存在', { status: false });
            return;
        }

        // 如果没有提供新的测试用例，则返回当前测试用例
        if (!testCases) {
            console.log('返回当前测试用例');
            ctx.status = 200;
            ctx.body = new responseClass(200, '获取成功', {
                status: true,
                data: {
                    testKey: test.key,
                    testName: test.test_name,
                    testCases: test.testCases || []
                }
            });
            return;
        }

        // 更新测试用例
        test.testCases = testCases;
        await testRepository.save(test);
        console.log('测试用例已更新');

        ctx.status = 200;
        ctx.body = new responseClass(200, '测试用例已更新', {
            status: true,
            data: {
                testKey: test.key,
                testName: test.test_name,
                testCases: test.testCases
            }
        });
    } catch (error) {
        console.error('更新测试用例时出错:', error);
        ctx.status = 500;
        ctx.body = new responseClass(500, '服务器错误', {
            status: false,
            error: error instanceof Error ? error.message : String(error)
        });
    }
}; 