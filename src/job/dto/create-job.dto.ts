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
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class JobSkillDto {
  @IsUUID()
  @IsNotEmpty()
  skillId: string;
}

export class JobDistrictDto {
  @IsUUID()
  @IsNotEmpty()
  districtId: string;
}

export class CreateJobDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsOptional()
  requirements?: string;

  @IsString()
  @IsOptional()
  benefits?: string;

  @IsEnum(JobLevel, { message: 'Invalid job level' })
  @IsNotEmpty()
  level: JobLevel;

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
  @IsNotEmpty()
  workingModel: WorkingModel;

  @IsUUID()
  @IsNotEmpty()
  locationId: string;

  @IsUUID()
  @IsNotEmpty()
  industryId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => JobSkillDto)
  skills: JobSkillDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => JobDistrictDto)
  districts: JobDistrictDto[];
}
