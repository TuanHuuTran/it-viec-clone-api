
import { JobLevel, WorkingModel } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class JobQueryDto {
  @IsString()
  @IsOptional()
  query?: string;

  @IsEnum(JobLevel, { each: true })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string' && value.includes(',')) {
      return value.split(',');
    }
    if (typeof value === 'string') {
      return [value];
    }
    return value;
  })
  levels?: JobLevel[];

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  minSalary?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  maxSalary?: number;

  @IsEnum(WorkingModel, { each: true })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string' && value.includes(',')) {
      return value.split(',');
    }
    if (typeof value === 'string') {
      return [value];
    }
    return value;
  })
  workingModels?: WorkingModel[];

  @IsUUID(undefined, { each: true })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string' && value.includes(',')) {
      return value.split(',');
    }
    if (typeof value === 'string') {
      return [value];
    }
    return value;
  })
  locationIds?: string[];

  @IsUUID(undefined, { each: true })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string' && value.includes(',')) {
      return value.split(',');
    }
    if (typeof value === 'string') {
      return [value];
    }
    return value;
  })
  districtIds?: string[];

  @IsUUID(undefined, { each: true })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string' && value.includes(',')) {
      return value.split(',');
    }
    if (typeof value === 'string') {
      return [value];
    }
    return value;
  })
  industryIds?: string[];

  @IsUUID(undefined, { each: true })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string' && value.includes(',')) {
      return value.split(',');
    }
    if (typeof value === 'string') {
      return [value];
    }
    return value;
  })
  skillIds?: string[];

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  isActive?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  limit?: number = 10;

  @IsString()
  @IsOptional()
  sortBy?: string = 'createdAt';

  @IsString()
  @IsOptional()
  sortOrder?: 'asc' | 'desc' = 'desc';
}
