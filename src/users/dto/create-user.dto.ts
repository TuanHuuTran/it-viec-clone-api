import { RoleType } from "@prisma/client";
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";

export class CreateUserDTO {
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  email: string

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string

  @IsString()
  @IsNotEmpty()
  name: string

  @IsEnum(RoleType, { message: 'Invalid role type. Must be one of: ADMIN, EMPLOYER, CANDIDATE, MODERATOR, VISITOR' })
  @IsNotEmpty()
  @IsOptional()
  role: RoleType
}
