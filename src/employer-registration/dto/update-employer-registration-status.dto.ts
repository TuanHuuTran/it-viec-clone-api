import { RegistrationStatus, RoleType } from "@prisma/client";
import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class UpdateStatusDTO {
  @IsEnum(RoleType, { message: 'Invalid role type. Must be one of: ADMIN, EMPLOYER, CANDIDATE, MODERATOR, VISITOR' })
  @IsNotEmpty()
  role: RoleType

  @IsEnum(RegistrationStatus, { message: 'Invalid status type. Must be one of: PENDING, APPROVED, REJECTED' })
  @IsNotEmpty()
  status: RegistrationStatus

  @IsString()
  @IsOptional()
  notes?: string
}
