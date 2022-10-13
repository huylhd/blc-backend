import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { genId } from "src/utils/genid.util";
import { Repository } from "typeorm";
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
    const newComment = this.commentRepo.create({
      ...createCommentDto,
      id: genId(),
      postId,
      authorId,
    });
    await this.commentRepo.insert(newComment);
    return newComment;
  }
}
