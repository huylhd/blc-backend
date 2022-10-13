import { Comment } from "src/modules/comments/entities/comment.entity";
import { Post } from "src/modules/posts/entities/post.entity";
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
} from "typeorm";

@Entity({
  name: "users",
})
export class User {
  @PrimaryColumn()
  id: string;

  @Column({ unique: true })
  username: string;

  @OneToMany(() => Post, (post) => post.author)
  posts: Post[];

  @OneToMany(() => Comment, (comment) => comment.author)
  comments: Comment[];

  @CreateDateColumn()
  createdAt: Date;
}
