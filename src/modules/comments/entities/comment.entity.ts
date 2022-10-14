import { Post } from "src/modules/posts/entities/post.entity";
import { User } from "src/modules/users/entities/user.entity";
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from "typeorm";

@Entity({
  name: "comments",
})
export class Comment {
  @PrimaryColumn()
  id: string;

  @Column()
  comment: string;

  @ManyToOne(() => User, (user) => user.comments, {
    cascade: true,
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "authorId" })
  author: User;

  @Column({ nullable: true })
  authorId: string;

  @ManyToOne(() => Post, (post) => post.comments, {
    cascade: true,
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "postId" })
  post: Post;

  @Column({ nullable: true })
  postId: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ default: false })
  isDeleted: boolean;
}
