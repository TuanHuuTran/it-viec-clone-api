import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  MinLength
} from 'class-validator';

enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER'
}

enum CareerLevel {
  JUNIOR = 'JUNIOR',
  MIDDLE = 'MIDDLE',
  SENIOR = 'SENIOR',
  LEAD = 'LEAD',
  MANAGER = 'MANAGER',
  DIRECTOR = 'DIRECTOR',
  CXO = 'CXO'
}

enum WorkingModel {
  ONSITE = 'ONSITE',
  REMOTE = 'REMOTE',
  HYBRID = 'HYBRID'
}

export class CreateCandidateProfileDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @MinLength(10, { message: 'Bio must be at least 10 characters long' })
  @IsOptional()
  bio?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsDateString()
  @IsOptional()
  dateOfBirth?: string;

  @IsEnum(Gender, { message: 'Invalid gender value' })
  @IsOptional()
  gender?: Gender;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsUrl({}, { message: 'Invalid avatar URL' })
  @IsOptional()
  avatarUrl?: string;

  @IsUrl({}, { message: 'Invalid cover image URL' })
  @IsOptional()
  coverImageUrl?: string;

  @IsString()
  @IsOptional()
  currentPosition?: string;

  @IsNumber()
  @IsOptional()
  yearsOfExperience?: number;

  @IsEnum(CareerLevel, { message: 'Invalid career level value' })
  @IsOptional()
  careerLevel?: CareerLevel;

  @IsNumber()
  @IsOptional()
  expectedSalary?: number;

  @IsString()
  @IsOptional()
  salaryCurrency?: string;

  @IsBoolean()
  @IsOptional()
  showExpectedSalary?: boolean;

  @IsBoolean()
  @IsOptional()
  isOpenToWork?: boolean;

  @IsEnum(WorkingModel, { message: 'Invalid working model value' })
  @IsOptional()
  preferredWorkingModel?: WorkingModel;

  @IsUrl({}, { message: 'Invalid LinkedIn URL' })
  @IsOptional()
  linkedinUrl?: string;

  @IsUrl({}, { message: 'Invalid GitHub URL' })
  @IsOptional()
  githubUrl?: string;

  @IsUrl({}, { message: 'Invalid portfolio URL' })
  @IsOptional()
  portfolioUrl?: string;
}
