
import { IsOptional, IsString } from 'class-validator';

export class UpdateUserRoleDTO {
  @IsString()
  @IsOptional()
  assignedBy?: string;
}
