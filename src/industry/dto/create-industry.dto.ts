import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateIndustryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;
}
