import { getConnection } from "typeorm";
import { Test } from "../entity/Test";
import { TestPaper } from "../entity/TestPaper";

export class TestService {
    private static async validatePaperKey(paperKey: number): Promise<boolean> {
        const connection = getConnection('examydb');
        const paperRepository = connection.getRepository(TestPaper);
        const paper = await paperRepository.findOne(paperKey);
        return !!paper;
    }

    public static async createTest(testData: Partial<Test>): Promise<Test> {
        try {
            const connection = getConnection('examydb');
            const testRepository = connection.getRepository(Test);

            // 验证paperKey是否存在
            if (!testData.paperKey || !(await this.validatePaperKey(testData.paperKey))) {
                throw new Error('无效的试卷ID');
            }

            const test = testRepository.create(testData);
            return await testRepository.save(test);
        } catch (error) {
            console.error('创建测试题目时出错:', error);
            throw error;
        }
    }

    public static async updateTest(key: number, testData: Partial<Test>): Promise<Test> {
        try {
            const connection = getConnection('examydb');
            const testRepository = connection.getRepository(Test);

            // 查找现有的测试题目
            const existingTest = await testRepository.findOne(key);
            if (!existingTest) {
                throw new Error('测试题目不存在');
            }

            // paperKey不允许更新
            delete testData.paperKey;

            // 更新测试题目
            const updatedTest = testRepository.merge(existingTest, testData);
            return await testRepository.save(updatedTest);
        } catch (error) {
            console.error('更新测试题目时出错:', error);
            throw error;
        }
    }

    public static async deleteTest(key: number): Promise<void> {
        try {
            const connection = getConnection('examydb');
            const testRepository = connection.getRepository(Test);

            const test = await testRepository.findOne(key);
            if (!test) {
                throw new Error('测试题目不存在');
            }

            await testRepository.remove(test);
        } catch (error) {
            console.error('删除测试题目时出错:', error);
            throw error;
        }
    }

    public static async getTestById(key: number): Promise<Test> {
        try {
            const connection = getConnection('examydb');
            const testRepository = connection.getRepository(Test);

            const test = await testRepository.findOne(key, {
                relations: ['paper', 'comments']
            });

            if (!test) {
                throw new Error('测试题目不存在');
            }

            return test;
        } catch (error) {
            console.error('获取测试题目时出错:', error);
            throw error;
        }
    }

    public static async getTestsByPaper(paperKey: number): Promise<Test[]> {
        try {
            const connection = getConnection('examydb');
            const testRepository = connection.getRepository(Test);

            return await testRepository.find({
                where: { paperKey },
                relations: ['comments'],
                order: { num: 'ASC' }
            });
        } catch (error) {
            console.error('获取试卷题目列表时出错:', error);
            throw error;
        }
    }
} 