import { SetMetadata } from '@nestjs/common';
import { RoleType } from '@prisma/client';
export const RequireRoles = (...roles: RoleType[]) =>
  SetMetadata('roles', roles);
