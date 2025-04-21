import { IsOptional, IsString } from 'class-validator';

export class UpdateIndustryDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;
}
