import {
  Controller,
  Post,
  Body,
  UseGuards,
  Param,
  NotFoundException,
  Delete,
  ForbiddenException,
  UnprocessableEntityException,
} from "@nestjs/common";
import { ApiOperation, ApiSecurity, ApiTags } from "@nestjs/swagger";
import { RequestUser } from "src/decorators/user.decorator";
import { AuthHeaders } from "src/enums/auth-header.enum";
import { AuthGuard } from "src/guards/auth.guard";
import { PostsService } from "../posts/posts.service";
import { User } from "../users/entities/user.entity";
import { CommentsService } from "./comments.service";
import { CreateCommentDto } from "./dto/create-comment.dto";

@UseGuards(AuthGuard)
@Controller()
@ApiTags("comments", "v1")
@ApiSecurity(AuthHeaders.USER)
export class CommentsController {
  constructor(
    private readonly commentsService: CommentsService,
    private readonly postsService: PostsService,
  ) {}

  @Post("posts/:postId/comments")
  @ApiOperation({ summary: "Create a new comment on a post" })
  async create(
    @RequestUser() user: User,
    @Body() createCommentDto: CreateCommentDto,
    @Param("postId") postId: string,
  ) {
    const post = await this.postsService.findOne(postId);
    if (!post) {
      throw new NotFoundException("Post not found");
    }
    const newComment = await this.commentsService.create(
      createCommentDto,
      postId,
      user.id,
    );
    if (!newComment) {
      throw new UnprocessableEntityException("Failed to add comment");
    }
    return newComment;
  }

  @Delete("posts/:postId/comments/:commentId")
  @ApiOperation({
    summary: "Delete a comment made by current user (soft delete)",
  })
  async delete(
    @RequestUser() user: User,
    @Param("postId") postId: string,
    @Param("commentId") commentId: string,
  ) {
    const post = await this.postsService.findOne(postId);
    if (!post) {
      throw new NotFoundException("Post not found");
    }
    const comment = await this.commentsService.findOne(commentId);
    if (!comment) {
      throw new NotFoundException("Comment not found");
    }
    if (comment.authorId !== user.id) {
      throw new ForbiddenException(
        "You don't have permission to delete this comment",
      );
    }
    return {
      success: await this.commentsService.delete(commentId),
    };
  }
}
