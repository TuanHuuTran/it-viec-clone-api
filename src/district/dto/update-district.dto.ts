import { IsOptional, IsString } from 'class-validator';

export class UpdateDistrictDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  locationId?: string;
}
