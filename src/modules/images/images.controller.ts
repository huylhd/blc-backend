import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  BadRequestException,
} from "@nestjs/common";
import { ImagesService } from "./images.service";
import { FileInterceptor } from "@nestjs/platform-express";
import { RequestUser } from "src/decorators/user.decorator";
import { AuthGuard } from "src/guards/auth.guard";
import { User } from "../users/entities/user.entity";
import { InjectQueue } from "@nestjs/bull";
import { Queue } from "bull";
import { mimeTypeFilter } from "src/filters/mime-type.filter";
import { QueueNames } from "src/enums/queue-names.enum";

@UseGuards(AuthGuard)
@Controller("images")
export class ImagesController {
  constructor(
    private readonly imagesService: ImagesService,

    @InjectQueue(QueueNames.IMAGE) private imageQueue: Queue,
  ) {}

  @Post("upload")
  @UseInterceptors(
    FileInterceptor("file", {
      limits: {
        fileSize: 1000 * 1000 * 100,
      },
      fileFilter: mimeTypeFilter("jpg", "jpeg", "png", "bmp"),
    }),
  )
  async create(
    @UploadedFile() file: Express.Multer.File,
    @RequestUser() user: User,
  ) {
    if (!file) throw new BadRequestException("No file was uploaded");
    const image = await this.imagesService.create(
      { originalName: file.originalname },
      user.id,
    );

    // Add a job to processing queue
    this.imageQueue.add(
      "resizeAndUpload",
      { imageId: image.id, bufferStr: file.buffer.toString("base64") },
      { removeOnComplete: true },
    );

    /* 
    Return image record, the client can do some form of 
    polling to get image url when it's done
    */
    return image;
  }
}
