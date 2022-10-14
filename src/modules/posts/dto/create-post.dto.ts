import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class CreatePostDto {
  @IsString()
  @ApiProperty()
  imageUrl: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  caption?: string;
}
