import { IsOptional, IsString } from "class-validator";

export class UpdateLocationDto {
  @IsString()
  @IsOptional()
  name?: string;
}
