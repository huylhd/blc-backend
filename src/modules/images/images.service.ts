import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { SQS } from "aws-sdk";
import { genId } from "src/utils/genid.util";
import { Repository } from "typeorm";
import { CreateImageDto } from "./dto/create-image.dto";
import { Image } from "./entities/image.entity";

@Injectable()
export class ImagesService {
  constructor(
    @InjectRepository(Image)
    private imageRepo: Repository<Image>,

    private configService: ConfigService,
  ) {}

  async create(
    createImageDto: CreateImageDto,
    authorId: string,
  ): Promise<Image> {
    const newImage = this.imageRepo.create({
      ...createImageDto,
      id: genId(),
      authorId,
    });
    await this.imageRepo.insert(newImage);
    return newImage;
  }

  findOne(id: string): Promise<Image> {
    return this.imageRepo.findOneBy({ id });
  }

  sendToQueue(imageId: string, base64Str: string) {
    return new Promise<any>((resolve, reject) => {
      const sqs = new SQS();
      sqs.sendMessage(
        {
          QueueUrl: this.configService.get("sqs_image_queue"),
          MessageBody: JSON.stringify({
            imageId,
            base64Str,
          }),
        },
        (err, data) => {
          if (err) {
            return reject(err);
          }
          return resolve(data);
        },
      );
    });
  }
}
