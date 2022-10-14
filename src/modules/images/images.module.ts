import { Module } from "@nestjs/common";
import { ImagesService } from "./images.service";
import { ImagesController } from "./images.controller";
import { Image } from "./entities/image.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ImagesConsumer } from "./images.consumer";
import { BullModule } from "@nestjs/bull";
import { S3Provider } from "src/providers/s3.provider";
import { QueueNames } from "src/enums/queue-names.enum";

@Module({
  imports: [
    TypeOrmModule.forFeature([Image]),
    BullModule.registerQueue({
      name: QueueNames.IMAGE,
      limiter: {
        max: 5,
        duration: 3000,
      },
    }),
  ],
  controllers: [ImagesController],
  providers: [S3Provider, ImagesService, ImagesConsumer],
})
export class ImagesModule {}
