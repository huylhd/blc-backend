import { IsOptional, IsString } from "class-validator";

export class CreatePostDto {
  @IsString()
  imageUrl: string;

  @IsString()
  @IsOptional()
  caption?: string;
}
