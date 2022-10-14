import { Comment } from "src/modules/comments/entities/comment.entity";
import { User } from "src/modules/users/entities/user.entity";
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  CreateDateColumn,
  OneToMany,
  Generated,
} from "typeorm";

@Entity({
  name: "posts",
})
export class Post {
  @PrimaryColumn()
  id: string;

  @Column()
  @Generated()
  seqId: number;

  @Column({ default: 0 })
  commentCount: number;

  @Column()
  imageUrl: string;

  @Column({ nullable: true })
  caption: string;

  @ManyToOne(() => User, (user) => user.posts, {
    cascade: true,
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "authorId" })
  author: User;

  @Column({ nullable: true })
  authorId: string;

  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[];

  @CreateDateColumn()
  createdAt: Date;

  @Column({ default: false })
  isDeleted: boolean;
}
