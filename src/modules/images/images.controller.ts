import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  BadRequestException,
  Res,
  HttpStatus,
  Get,
  Param,
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
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { Response } from "express";
import { SQS } from "aws-sdk";

@UseGuards(AuthGuard)
@Controller("images")
@ApiTags("images", "v1")
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
  @ApiOperation({ summary: "Upload a new image" })
  async create(
    @Res() res: Response,
    @UploadedFile() file: Express.Multer.File,
    @RequestUser() user: User,
  ) {
    if (!file) throw new BadRequestException("No file was uploaded");
    const image = await this.imagesService.create(
      { originalName: file.originalname },
      user.id,
    );

    await this.imagesService.sendToQueue(
      image.id,
      file.buffer.toString("base64"),
    );

    /* 
    Return image record, the client can do some form of 
    polling to get image url when it's done
    */
    res.status(HttpStatus.CREATED).json(image);

    // Add a job to processing queue
    // await this.imageQueue.add(
    //   "resizeAndUpload",
    //   { imageId: image.id, bufferStr: file.buffer.toString("base64") },
    //   { removeOnComplete: true },
    // );
  }

  @Get(":id")
  @ApiOperation({ summary: "Get an image" })
  async get(@Param("id") id: string) {
    return this.imagesService.findOne(id);
  }
}
