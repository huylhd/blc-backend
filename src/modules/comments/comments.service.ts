import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { genId } from "src/utils/genid.util";
import { Repository } from "typeorm";
import { Post } from "../posts/entities/post.entity";
import { CreateCommentDto } from "./dto/create-comment.dto";
import { Comment } from "./entities/comment.entity";

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private commentRepo: Repository<Comment>,
  ) {}

  async create(
    createCommentDto: CreateCommentDto,
    postId: string,
    authorId: string,
  ) {
    const queryRunner = this.commentRepo.manager.connection.createQueryRunner();

    /* START TRANSACTION */
    await queryRunner.startTransaction();
    try {
      // Update the commentCount of post before adding a comment
      const postUpdateResult = await queryRunner.manager.update(Post, postId, {
        commentCount: () => '"commentCount" + 1',
      });
      if (postUpdateResult.affected < 1) {
        throw Error();
      }
      const newComment = this.commentRepo.create({
        ...createCommentDto,
        id: genId(),
        postId,
        authorId,
      });
      await queryRunner.manager.save(newComment);
      await queryRunner.commitTransaction();
      return newComment;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      return null;
    } finally {
      queryRunner.release();
    }
    /* END TRANSACTION */
  }

  findOne(id: string) {
    return this.commentRepo.findOneBy({ id, isDeleted: false });
  }

  async delete(commentId: string) {
    const queryRunner = this.commentRepo.manager.connection.createQueryRunner();

    /* START TRANSACTION */
    await queryRunner.startTransaction();
    try {
      const comment = await queryRunner.manager.findOneBy(Comment, {
        id: commentId,
      });
      if (!comment) {
        throw Error("Comment not found");
      }
      // Update the commentCount of post before adding a comment
      const postUpdateResult = await queryRunner.manager.update(
        Post,
        comment.postId,
        {
          commentCount: () => '"commentCount" - 1',
        },
      );
      if (postUpdateResult.affected < 1) {
        throw Error("Failed to update post");
      }
      comment.isDeleted = true;
      await queryRunner.manager.save(comment);
      await queryRunner.commitTransaction();
      return true;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      return false;
    } finally {
      queryRunner.release();
    }
    /* END TRANSACTION */
  }

  save(comment: Comment) {
    return this.commentRepo.save(comment);
  }
}
