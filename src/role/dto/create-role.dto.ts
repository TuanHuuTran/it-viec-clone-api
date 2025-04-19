import { RoleType } from "@prisma/client";
import { IsEnum, IsNotEmpty, IsString } from "class-validator";

export class CreateRoleDTO {
  @IsEnum(RoleType)
  @IsString()
  @IsNotEmpty()
  name: RoleType

  @IsString()
  @IsNotEmpty()
  description: string
}
