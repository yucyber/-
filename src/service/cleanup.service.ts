import { getConnection } from "typeorm";
import { Test } from "../entity/Test";

export class CleanupService {
    public static async cleanupOrphanedTests(): Promise<{ deletedCount: number }> {
        try {
            console.log('开始清理无效测试记录');
            const connection = getConnection();
            const testRepository = connection.getRepository(Test);

            // 先找出所有paperKey为NULL的记录
            const orphanedTests = await testRepository.find({
                where: {
                    paperKey: null
                }
            });

            console.log(`找到${orphanedTests.length}条无效测试记录`);

            // 如果有找到无效记录，则删除它们
            if (orphanedTests.length > 0) {
                await testRepository.remove(orphanedTests);
                console.log(`成功删除${orphanedTests.length}条无效测试记录`);
            }

            return {
                deletedCount: orphanedTests.length
            };
        } catch (error) {
            console.error('清理无效测试记录时出错:', error);
            throw error;
        }
    }
} 