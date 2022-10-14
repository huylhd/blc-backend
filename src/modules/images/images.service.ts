import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { genId } from "src/utils/genid.util";
import { Repository } from "typeorm";
import { CreateImageDto } from "./dto/create-image.dto";
import { Image } from "./entities/image.entity";

@Injectable()
export class ImagesService {
  constructor(
    @InjectRepository(Image)
    private imageRepo: Repository<Image>,
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
}
