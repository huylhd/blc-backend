import { Type } from "class-transformer";
import { IsNumber, IsOptional, IsString, Max } from "class-validator";

export class FindAllPostDto {
  @IsString()
  @IsOptional()
  cursor: string;

  @IsNumber()
  @IsOptional()
  @Max(10)
  @Type(() => Number)
  limit: number;
}
