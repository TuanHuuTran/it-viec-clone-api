import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateUserRoleDTO {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  roleId: string;
}
