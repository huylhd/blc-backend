import { values } from "lodash";
import { ImageStatusEnum } from "src/enums/image-status.enum";
import { User } from "src/modules/users/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";

@Entity({
  name: "images",
})
export class Image {
  @PrimaryColumn()
  id: string;

  @Column({ nullable: true })
  originalPath: string;

  @Column({ nullable: true })
  resizePath: string;

  @Column()
  originalName: string;

  @ManyToOne(() => User, (user) => user.images, {
    cascade: true,
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "authorId" })
  author: User;

  @Column({ nullable: true })
  authorId: string;

  @Column({ enum: values(ImageStatusEnum), default: ImageStatusEnum.STARTED })
  status: string;
}
