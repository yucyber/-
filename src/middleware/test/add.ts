import { Context } from 'koa';
import { getConnection } from 'typeorm';
import { Test } from '../../entity/Test';
import { TestPaper } from '../../entity/TestPaper';
import responseClass from '../../config/responseClass';

interface AddTestRequest {
    paper: string;
    test_name: string;
    test: string;
    answer: string;
    tags: string;
    level: string;
    point: number;
    cookie: string;
}

export default async (ctx: Context) => {
    try {
        const { paper, test_name, test, answer, tags, level, point } = ctx.request.body as AddTestRequest;
        console.log('添加题目请求:', { paper, test_name, level, point });

        // 使用默认连接
        const testRepository = getConnection().getRepository(Test);
        const paperRepository = getConnection().getRepository(TestPaper);

        // 查找试卷
        const paperEntity = await paperRepository.findOne({
            where: { paper_name: paper }
        });

        if (!paperEntity) {
            console.log('试卷不存在:', { paper });
            ctx.status = 404;
            ctx.body = new responseClass(404, "试卷不存在", { status: false });
            return;
        }

        console.log('找到试卷:', { paper: paperEntity.paper_name, total_num: paperEntity.total_num });

        // 获取当前试题数量作为序号
        const num = String(paperEntity.total_num + 1 || 1);

        // 创建新的试题
        const newTest = new Test();
        newTest.num = num;
        newTest.test_name = test_name;
        newTest.test = test;
        newTest.paperKey = paperEntity.key;
        newTest.answer = answer;
        newTest.tags = tags ? tags.split(',') : [];
        newTest.level = level;
        newTest.point = point;
        newTest.testCases = [{
            input: ["1", "1"],  // 示例输入：两个数字 1
            output: ["1 + 1 = 2"]  // 期望输出
        }];
        newTest.template = {
            code: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        
        // 获取用户输入
        System.out.print("请输入第一个数字：");
        int num1 = scanner.nextInt();
        
        System.out.print("请输入第二个数字：");
        int num2 = scanner.nextInt();
        
        // 计算并输出结果
        System.out.println(num1 + " + " + num2 + " = " + (num1 + num2));
        
        scanner.close();  // 关闭输入流
    }
}`,
            language: "java"
        };

        try {
            // 保存新题目
            const savedTest = await testRepository.save(newTest);
            console.log('题目保存成功:', { key: savedTest.key, num: savedTest.num });

            // 使用查询构建器更新试卷的题目数量和总分
            const newTotalNum = (paperEntity.total_num || 0) + 1;
            const newTotalPoint = (paperEntity.total_point || 0) + point;

            // 使用明确的更新方法
            await paperRepository
                .createQueryBuilder()
                .update(TestPaper)
                .set({
                    total_num: newTotalNum,
                    total_point: newTotalPoint
                })
                .where("key = :key", { key: paperEntity.key })
                .execute();

            console.log('试卷更新成功:', {
                paper: paperEntity.paper_name,
                total_num: newTotalNum,
                total_point: newTotalPoint
            });

            ctx.status = 200;
            ctx.body = new responseClass(200, "添加成功", {
                status: true,
                key: savedTest.key,
                num: savedTest.num,
                level: savedTest.level,
                point: savedTest.point
            });
        } catch (saveError) {
            console.error('保存题目失败:', saveError);
            throw saveError;
        }

    } catch (error) {
        console.error('添加题目出错:', error);
        ctx.status = 500;
        ctx.body = new responseClass(500, "服务器错误", {
            status: false,
            error: error instanceof Error ? error.message : String(error)
        });
    }
}; 