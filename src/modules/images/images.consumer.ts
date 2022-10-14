import { Process, Processor } from "@nestjs/bull";
import { Inject, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { S3 } from "aws-sdk";
import { Job } from "bull";
import * as Jimp from "jimp";
import { ImageStatusEnum } from "src/enums/image-status.enum";
import { QueueNames } from "src/enums/queue-names.enum";
import { Repository } from "typeorm";
import { Image } from "./entities/image.entity";

@Processor(QueueNames.IMAGE)
export class ImagesConsumer {
  private readonly logger = new Logger(ImagesConsumer.name);

  constructor(
    @InjectRepository(Image)
    private imageRepo: Repository<Image>,

    @Inject("S3")
    private s3: S3,

    private configService: ConfigService,
  ) {}

  @Process("resizeAndUpload")
  async process(job: Job<any>) {
    const { imageId, bufferStr } = job.data;
    if (!imageId || !bufferStr) return;
    const image = await this.imageRepo.findOneBy({ id: imageId });
    if (!image || image.status !== ImageStatusEnum.STARTED) return;

    this.logger.log(`Process resizeAndUpload started for image #${imageId}`);

    try {
      const nameWithoutExtension = image.originalName
        .split(".")
        .slice(0, -1)
        .join(".");
      const originalFileName = `${image.id}-${image.originalName}`;
      const resizeFileName = `${image.id}-${nameWithoutExtension}-600x600.jpg`;
      const imageBuffer = Buffer.from(bufferStr, "base64");

      // Resize to 600x600 and reformat image to jpg
      const resizedImage = (await Jimp.read(imageBuffer)).resize(600, 600);

      // Upload original and resize images to S3
      const [originalUpload, resizeUpload] = await Promise.all([
        this.s3
          .upload({
            Bucket: this.configService.get("bucket"),
            Body: imageBuffer,
            Key: originalFileName,
          })
          .promise(),
        this.s3
          .upload({
            Bucket: this.configService.get("bucket"),
            Body: await resizedImage.getBufferAsync(Jimp.MIME_JPEG),
            Key: resizeFileName,
          })
          .promise(),
      ]);

      image.originalPath = originalUpload.Location;
      image.resizePath = resizeUpload.Location;
      image.status = ImageStatusEnum.UPLOADED;
    } catch (error) {
      this.logger.error(
        `Process resizeAndUpload for image #${imageId} failed: ${error.message}`,
      );
      image.status = ImageStatusEnum.FAILED;
    }
    await this.imageRepo.save(image);
    this.logger.log(`Process resizeAndUpload success for image #${imageId}`);
  }
}
