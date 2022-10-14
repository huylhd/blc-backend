import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { isNil } from "lodash";
import { genId } from "src/utils/genid.util";
import { Repository } from "typeorm";
import { Comment } from "../comments/entities/comment.entity";
import { CreatePostDto } from "./dto/create-post.dto";
import { Post } from "./entities/post.entity";
import { ICommentCursor } from "./interface/comment-cursor.interface";

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private postRepo: Repository<Post>,

    private configService: ConfigService,
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

  async findAll({
    limit = 10,
    cursor,
  }: {
    limit: number;
    cursor: ICommentCursor;
  }) {
    if (isNil(cursor?.commentCount)) {
      cursor.commentCount = "+inf";
    }
    cursor.seqId = cursor.seqId || -1;
    limit++;

    /* Implement querying with cursor */
    let cursorWhere = `WHERE "commentCount"::NUMERIC < $1::NUMERIC 
    OR ("commentCount"::NUMERIC = $1::NUMERIC AND "seqId" > $2::NUMERIC)
    ORDER BY "commentCount" DESC, "seqId" ASC`;

    if (cursor.type === "before") {
      cursorWhere = `WHERE "commentCount"::NUMERIC > $1::NUMERIC 
      OR ("commentCount"::NUMERIC = $1::NUMERIC AND "seqId" < $2::NUMERIC)
      ORDER BY "commentCount" ASC, "seqId" DESC`;
    }

    /* 
    This sub query is to limit number comments for each post
    The `commentsPerPost` limit is set in config, default = 2
    Comments are ordered by `createdAt` DESC 
    */
    const limitCommentQuery = `SELECT c.*
    FROM comments c WHERE c."createdAt" >= COALESCE(
    (SELECT c2."createdAt" FROM comments c2
    WHERE c2."postId" = c."postId"
    ORDER BY c2."createdAt" desc
    LIMIT 1 OFFSET $4)
    , c."createdAt")
    AND c."deletedAt" is null `;

    const rawResult: any[] = await this.postRepo.manager.query(
      `SELECT "commentCount", "imageUrl", "comment", "seqId",
        p."id" as "postId", p."authorId" as "postAuthorId", p."createdAt" as "postCreatedAt",
        c."id" as "commentId", c."authorId" as "commentAuthorId", c."createdAt" as "commentCreatedAt"
      FROM (SELECT * FROM posts ${cursorWhere} LIMIT $3) p
      LEFT JOIN (${limitCommentQuery}) c
      ON p."id" = c."postId"
      ORDER BY "commentCount" DESC, c."createdAt" DESC
      `,
      [
        cursor.commentCount,
        cursor.seqId,
        limit,
        this.configService.get<number>("post.commentsPerPost") - 1,
      ],
    );

    // Transform into JSON object
    const posts: Partial<Post & { commentCount: number }>[] = [];
    rawResult.forEach((row) => {
      let post = posts.find((post) => post.id === row.postId);
      if (!post) {
        post = {
          id: row.postId,
          seqId: row.seqId,
          imageUrl: row.imageUrl,
          authorId: row.postAuthorId,
          createdAt: row.postCreatedAt,
          commentCount: row.commentCount,
          comments: [],
        };
        posts.push(post);
      }
      const comment: Partial<Comment> = {
        id: row.commentId,
        comment: row.comment,
        authorId: row.commentAuthorId,
        createdAt: row.commentCreatedAt,
      };
      if (comment.id !== null) {
        post.comments.push(comment as any);
      }
    });

    return posts;
  }
}
