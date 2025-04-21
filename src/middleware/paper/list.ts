import { getConnection } from 'typeorm';
import { User } from '../../entity/User';
import { ListPaperRequest } from '../../interface/ListPaperRequest';

export async function list(ctx) {
    try {
        const { cookie } = ctx.request.body as ListPaperRequest;
        const userRepository = getConnection('examydb').getRepository(User);
        const findUser = await userRepository.findOne({ where: { session: cookie } });

        // ... existing code ...
    } catch (error) {
        // ... existing code ...
    }
} 