import { Context } from 'koa';
import { User } from '../../entity/User';
import { getManager, getConnection } from "typeorm";
import responseClass from '../../config/responseClass';

export default async (ctx: Context, next: any) => {
    try {
        const { email, interviewer } = ctx.request.body;
        console.log('模式切换请求:', { email, interviewer });

        const userRepository = getConnection('examydb').getRepository(User);
        const user = await userRepository.findOne({
            where: { email },
            select: ['email', 'interviewer']
        });

        if (!user) {
            console.log('用户不存在');
            ctx.body = new responseClass(200, '用户不存在', { success: false });
            return;
        }

        user.interviewer = interviewer;
        await userRepository.save(user);
        console.log('模式切换成功:', { email, interviewer });

        ctx.body = new responseClass(200, '模式切换成功', {
            success: true,
            interviewer
        });
    } catch (error) {
        console.error('模式切换出错:', error);
        ctx.body = new responseClass(500, '服务器错误', {
            success: false,
            error: error instanceof Error ? error.message : '未知错误'
        });
    }
} 