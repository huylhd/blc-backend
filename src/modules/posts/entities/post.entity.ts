import { User } from "src/modules/users/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";

@Entity({
  name: "posts",
})
export class Post {
  @PrimaryColumn()
  id: string;

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
}
