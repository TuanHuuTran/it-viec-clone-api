import { Controller, Get, UseGuards } from '@nestjs/common';
import { RoleType, User } from '@prisma/client';
import { GetUser } from 'src/auth/decorator/auth.decorator';
import { RequirePermission } from 'src/auth/decorator/auth.require-permission.decorator';
import { RequireRoles } from 'src/auth/decorator/auth.require-role.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/auth/guards/role-permission.guard';
import { RolesGuard } from 'src/auth/guards/role.guard';

@Controller('users')
export class UsersController {
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @RequireRoles(RoleType.CANDIDATE)
  @RequirePermission('jobs:read')
  @Get("/profile")
  getDetailUser(@GetUser() user: User) {
    return user
  }
}
