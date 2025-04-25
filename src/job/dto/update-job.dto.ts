import { JobLevel, WorkingModel } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { JobDistrictDto, JobSkillDto } from './create-job.dto';

export class UpdateJobDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  requirements?: string;

  @IsString()
  @IsOptional()
  benefits?: string;

  @IsEnum(JobLevel, { message: 'Invalid job level' })
  @IsOptional()
  level?: JobLevel;

  @IsNumber()
  @IsOptional()
  @Min(0)
  minSalary?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  maxSalary?: number;

  @IsBoolean()
  @IsOptional()
  showSalary?: boolean;

  @IsEnum(WorkingModel, { message: 'Invalid working model' })
  @IsOptional()
  workingModel?: WorkingModel;

  @IsUUID()
  @IsOptional()
  locationId?: string;

  @IsUUID()
  @IsOptional()
  industryId?: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => JobSkillDto)
  skills?: JobSkillDto[];

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => JobDistrictDto)
  districts?: JobDistrictDto[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
