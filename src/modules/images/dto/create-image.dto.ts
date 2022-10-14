import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class CreateImageDto {
  @IsString()
  @ApiProperty()
  originalName: string;
}
