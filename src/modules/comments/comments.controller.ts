import {
  Controller,
  Post,
  Body,
  UseGuards,
  Param,
  NotFoundException,
} from "@nestjs/common";
import { RequestUser } from "src/decorators/user.decorator";
import { AuthGuard } from "src/guards/auth.guard";
import { PostsService } from "../posts/posts.service";
import { User } from "../users/entities/user.entity";
import { CommentsService } from "./comments.service";
import { CreateCommentDto } from "./dto/create-comment.dto";

@UseGuards(AuthGuard)
@Controller()
export class CommentsController {
  constructor(
    private readonly commentsService: CommentsService,
    private readonly postsService: PostsService,
  ) {}

  @Post("/posts/:postId/comments")
  async create(
    @RequestUser() user: User,
    @Body() createCommentDto: CreateCommentDto,
    @Param("postId") postId: string,
  ) {
    const post = await this.postsService.findOne(postId);
    if (!post) {
      throw new NotFoundException("Post not found");
    }
    return this.commentsService.create(createCommentDto, postId, user.id);
  }
}
