import { Context } from 'koa';
import { getManager, getConnection } from "typeorm";
import { Test } from '../../entity/Test';
import { User } from '../../entity/User';
import { Comment } from '../../entity/Comment';
import responseClass from '../../config/responseClass';

interface CommentRequest {
  content?: string;
  testKey?: string;
  status?: boolean;
  like_num?: number;
  dislike_num?: number;
  comments?: string;
  test?: string;
  reqEmail?: string;
}

export default async (ctx: Context) => {
  try {
    const req = ctx.request.body as CommentRequest;
    const cookie = ctx.cookies.get('session');

    if (!cookie) {
      ctx.body = new responseClass(200, '您还未登录！如果您已注册，请先前往登录；如果还未注册，请先注册。');
      return;
    }

    const userRepository = getConnection('examydb').getRepository(User);
    const user = await userRepository.findOne({ where: { session: cookie } }) as User;

    if (!user) {
      ctx.body = new responseClass(200, '登录已过期，请重新登录');
      return;
    }

    const email = user.email;
    const { status, like_num, dislike_num, comments, test, reqEmail, content } = req;
    const commentRepository = getManager().getRepository(Comment);
    const testRepository = getManager().getRepository(Test);
    const saveTest = await testRepository.findOne({ test_name: test });
    const testKey = req.testKey || (saveTest ? saveTest.key : undefined);

    if (!saveTest) {
      ctx.status = 404;
      ctx.body = new responseClass(404, "试题不存在", { status: false });
      return;
    }

    if (status) {
      // status 为 false 说明是在评论，否则是在回复
      if (!status || (status && comments)) {
        const addComment = new Comment();
        addComment.like_num = 0;
        addComment.dislike_num = 0;
        addComment.comments = comments;
        addComment.email = email;
        if (!status) {
          addComment.order = 0;
        } else {
          const saveComment = await getManager().getRepository(Comment)
            .createQueryBuilder('comment')
            .leftJoinAndSelect('comment.tests', 'test.comments')
            .where('comment.tests = :testsKey', { testsKey: testKey })
            .andWhere({ email: reqEmail, order: 0 })
            .getOne();
          const key = saveComment?.key;
          addComment.order = key || 0;
        }
        saveTest.comments = [addComment];
        await testRepository.save(saveTest);
        await commentRepository.save(addComment);
        ctx.body = new responseClass(200, '评论信息获取成功', { status: true, data: addComment });
      } else {
        // 要区分"点赞"或"踩"的是用户的评论还是回复
        const saveComment = await getManager().getRepository(Comment)
          .createQueryBuilder('comment')
          .leftJoinAndSelect('comment.tests', 'test.comments')
          .where('comment.tests = :testsKey', { testsKey: testKey })
          .andWhere({ email: reqEmail, order: 0 })
          .getOne();
        if (!saveComment) {
          ctx.status = 404;
          ctx.body = new responseClass(404, "评论不存在", { status: false });
          return;
        }
        if (like_num !== 0) {
          saveComment.like_num = like_num;
        } else if (dislike_num !== 0) {
          saveComment.dislike_num = dislike_num;
        }
        await commentRepository.save(saveComment);
        ctx.body = new responseClass(200, '用户"点赞"或"踩"有效', { status: true, data: saveComment });
      }
    } else {
      const findComment = await getManager().getRepository(Comment)
        .createQueryBuilder('comment')
        .leftJoinAndSelect('comment.tests', 'test.comments')
        .where('comment.tests = :testsKey', { testsKey: testKey })
        .orderBy({
          "comment.order": "ASC",
        })
        .getMany();
      ctx.body = new responseClass(200, '单个试题的所有留言信息获取成功', { status: true, data: { findComment } });
    }
  } catch (err) {
    console.error('Error in comment:', err);
    ctx.body = new responseClass(500, '服务器错误', { error: err instanceof Error ? err.message : '未知错误' });
  }
};