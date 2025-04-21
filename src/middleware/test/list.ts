import { getConnection } from 'typeorm';
import { User } from '../../entity/User';
import { ListTestRequest } from '../../interface/ListTestRequest';

export async function list(ctx) {
    try {
        const { cookie, paper } = ctx.request.body as ListTestRequest;
        const userRepository = getConnection('examydb').getRepository(User);
        const findUser = await userRepository.findOne({ where: { session: cookie } });

        if (!findUser) {
            ctx.body = { status: false, message: '用户未找到' };
            return;
        }
    } catch (error) {
        console.error('Error in list middleware:', error);
        ctx.status = 500;
        ctx.body = { error: 'Internal Server Error' };
    }
} 