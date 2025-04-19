import { IsNotEmpty, IsString } from 'class-validator';

export class CreateRolePermissionDTO {
  @IsString()
  @IsNotEmpty()
  roleId: string;

  @IsString()
  @IsNotEmpty()
  permissionId: string;
}
