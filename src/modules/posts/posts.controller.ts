import { Controller, Post, Body, UseGuards, Get, Query } from "@nestjs/common";
import { PostsService } from "./posts.service";
import { CreatePostDto } from "./dto/create-post.dto";
import { AuthGuard } from "src/guards/auth.guard";
import { RequestUser } from "src/decorators/user.decorator";
import { User } from "../users/entities/user.entity";
import { FindAllPostDto } from "./dto/find-all-post.dto";
import {
  decodeCursor,
  getListAndPaging,
} from "src/utils/cursor-pagination.util";
import { cloneDeep } from "lodash";

@UseGuards(AuthGuard)
@Controller("posts")
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  create(@Body() createPostDto: CreatePostDto, @RequestUser() user: User) {
    return this.postsService.create(createPostDto, user.id);
  }

  @Get()
  async findAll(@Query() query: FindAllPostDto) {
    const { limit, cursor: encodedCursor } = query;
    const cursor = decodeCursor(encodedCursor);
    const data = await this.postsService.findAll({
      limit,
      cursor: cloneDeep(cursor),
    });
    return getListAndPaging({
      data,
      cursor,
      keys: ["commentCount", "seqId"],
      limit,
    });
  }
}
