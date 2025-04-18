import { RoleType } from "@prisma/client";
import { IsEnum, IsNotEmpty } from "class-validator";

export class AssignRoleDTO {
  @IsEnum(RoleType, { message: 'Invalid role type. Must be one of: ADMIN, EMPLOYER, CANDIDATE, MODERATOR, VISITOR' })
  @IsNotEmpty()
  role: RoleType
}
