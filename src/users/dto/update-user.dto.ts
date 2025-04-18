import { IsOptional, IsString, MinLength } from "class-validator";

export class UpdateUserDTO {
  @IsString()
  @IsOptional()
  @MinLength(6)
  password?: string

  @IsString()
  @IsOptional()
  name?: string
}
