import { Context } from "koa";
import { CleanupService } from "../../service/cleanup.service";
import responseClass from '../../config/responseClass';

export default async (ctx: Context) => {
    try {
        const result = await CleanupService.cleanupOrphanedTests();

        ctx.status = 200;
        ctx.body = new responseClass(200, `成功清理 ${result.deletedCount} 条无效记录`, {
            status: true,
            deletedCount: result.deletedCount
        });
    } catch (error) {
        console.error('清理无效记录失败:', error);
        ctx.status = 500;
        ctx.body = new responseClass(500, "服务器错误", {
            status: false,
            error: error instanceof Error ? error.message : String(error)
        });
    }
}; 