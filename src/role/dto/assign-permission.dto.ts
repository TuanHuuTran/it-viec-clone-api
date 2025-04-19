import { IsNotEmpty, IsString } from "class-validator";

export class AssignPermissionDTO {
  @IsString()
  @IsNotEmpty()
  permissionId: string
}
