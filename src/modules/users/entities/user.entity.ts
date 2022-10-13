import { Post } from "src/modules/posts/entities/post.entity";
import { Column, Entity, OneToMany, PrimaryColumn } from "typeorm";

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
}
