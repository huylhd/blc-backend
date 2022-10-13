import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { genId } from "src/utils/genid.util";
import { Repository } from "typeorm";
import { CreatePostDto } from "./dto/create-post.dto";
import { Post } from "./entities/post.entity";

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private postRepo: Repository<Post>,
  ) {}

  async create(createPostDto: CreatePostDto, authorId: string) {
    const newPost = this.postRepo.create({
      ...createPostDto,
      id: genId(),
      authorId,
    });
    await this.postRepo.insert(newPost);
    return newPost;
  }

  findOne(id: string) {
    return this.postRepo.findOneBy({ id });
  }
}
