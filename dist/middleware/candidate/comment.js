"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const Test_1 = __importDefault(require("../../entity/Test"));
const User_1 = __importDefault(require("../../entity/User"));
const Comment_1 = __importDefault(require("../../entity/Comment"));
const responseClass_1 = __importDefault(require("../../config/responseClass"));
exports.default = async (ctx) => {
    try {
        const req = ctx.request.body;
        const { status, cookie, like_num, dislike_num, comments, test, reqEmail, } = req;
        const commentRepository = (0, typeorm_1.getManager)().getRepository(Comment_1.default);
        const testRepository = (0, typeorm_1.getManager)().getRepository(Test_1.default);
        const userRepository = (0, typeorm_1.getManager)().getRepository(User_1.default);
        const saveTest = await testRepository.findOne({ test_name: test });
        const testKey = saveTest ? saveTest.key : undefined;
        if (!saveTest) {
            ctx.status = 404;
            ctx.body = new responseClass_1.default(404, "试题不存在", { status: false });
            return;
        }
        if (status) {
            const user = await userRepository.findOne({ session: cookie });
            if (!user) {
                ctx.status = 404;
                ctx.body = new responseClass_1.default(404, "用户未找到", { status: false });
                return;
            }
            const email = user.email;
            // status 为 false 说明是在评论，否则是在回复
            if (!status || (status && comments)) {
                const addComment = new Comment_1.default();
                addComment.like_num = 0;
                addComment.dislike_num = 0;
                addComment.comments = comments;
                addComment.email = email;
                if (!status) {
                    addComment.order = 0;
                }
                else {
                    const saveComment = await (0, typeorm_1.getRepository)(Comment_1.default)
                        .createQueryBuilder('comment')
                        .leftJoinAndSelect('comment.tests', 'test.comments')
                        .where('comment.tests = :testsKey', { testsKey: testKey })
                        .andWhere({ email: reqEmail, order: 0 })
                        .getOne();
                    const key = saveComment === null || saveComment === void 0 ? void 0 : saveComment.key;
                    addComment.order = key || 0;
                }
                saveTest.comments = [addComment];
                await testRepository.save(saveTest);
                await commentRepository.save(addComment);
                ctx.body = new responseClass_1.default(200, '评论信息获取成功', { status: true, data: addComment });
            }
            else {
                // 要区分"点赞"或"踩"的是用户的评论还是回复
                const saveComment = await (0, typeorm_1.getRepository)(Comment_1.default)
                    .createQueryBuilder('comment')
                    .leftJoinAndSelect('comment.tests', 'test.comments')
                    .where('comment.tests = :testsKey', { testsKey: testKey })
                    .andWhere({ email: reqEmail, order: 0 })
                    .getOne();
                if (!saveComment) {
                    ctx.status = 404;
                    ctx.body = new responseClass_1.default(404, "评论不存在", { status: false });
                    return;
                }
                if (like_num !== 0) {
                    saveComment.like_num = like_num;
                }
                else if (dislike_num !== 0) {
                    saveComment.dislike_num = dislike_num;
                }
                await commentRepository.save(saveComment);
                ctx.body = new responseClass_1.default(200, '用户"点赞"或"踩"有效', { status: true, data: saveComment });
            }
        }
        else {
            const findComment = await (0, typeorm_1.getRepository)(Comment_1.default)
                .createQueryBuilder('comment')
                .leftJoinAndSelect('comment.tests', 'test.comments')
                .where('comment.tests = :testsKey', { testsKey: testKey })
                .orderBy({
                "comment.order": "ASC",
            })
                .getMany();
            ctx.body = new responseClass_1.default(200, '单个试题的所有留言信息获取成功', { status: true, data: { findComment } });
        }
    }
    catch (error) {
        ctx.status = 500;
        ctx.body = new responseClass_1.default(500, "服务器错误", { status: false, error: error instanceof Error ? error.message : String(error) });
    }
};
//# sourceMappingURL=comment.js.map