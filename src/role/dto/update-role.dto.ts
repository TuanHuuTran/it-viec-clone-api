import { IsEnum, IsOptional, IsString } from 'class-validator';
import { RoleType } from '@prisma/client';

export class UpdateRoleDTO {
  @IsEnum(RoleType)
  @IsOptional()
  name?: RoleType;

  @IsString()
  @IsOptional()
  description?: string;
}
