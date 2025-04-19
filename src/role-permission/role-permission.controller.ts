import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { RolePermissionService } from './role-permission.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/role.guard';
import { RequireRoles } from 'src/auth/decorator/auth.require-role.decorator';
import { RoleType } from '@prisma/client';
import { CreateRolePermissionDTO } from './dto';
import { PermissionsGuard } from 'src/auth/guards/role-permission.guard';
import { RequirePermission } from 'src/auth/decorator/auth.require-permission.decorator';

@Controller('role-permissions')
@UseGuards(JwtAuthGuard)
export class RolePermissionController {
  constructor(private rolePermissionService: RolePermissionService) { }

  @Post()
  @UseGuards(RolesGuard)
  @RequireRoles(RoleType.ADMIN)
  async create(@Body() createRolePermissionDto: CreateRolePermissionDTO) {
    return await this.rolePermissionService.create(createRolePermissionDto)
  }

  @Get()
  @UseGuards(PermissionsGuard)
  @RequirePermission('permissions:read')
  async findAll() {
    return await this.rolePermissionService.findAll();
  }

  @Get(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermission('permissions:read')
  async findOne(@Param('id') id: string) {
    return await this.rolePermissionService.findOne(id);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @RequireRoles(RoleType.ADMIN)
  async remove(@Param('id') id: string) {
    return await this.rolePermissionService.remove(id);
  }

  @Get('role/:roleId/permission/:permissionId')
  @UseGuards(PermissionsGuard)
  @RequirePermission('permissions:read')
  async findByRoleAndPermission(
    @Param('roleId') roleId: string,
    @Param('permissionId') permissionId: string
  ) {
    return await this.rolePermissionService.findByRoleAndPermission(roleId, permissionId);
  }

  @Get('permission/:permissionId')
  @UseGuards(PermissionsGuard)
  @RequirePermission('permissions:read')
  async getByPermission(@Param('permissionId') permissionId: string) {
    return await this.rolePermissionService.getByPermission(permissionId);
  }

  @Get('role/:roleId')
  @UseGuards(PermissionsGuard)
  @RequirePermission('permissions:read')
  async getByRole(@Param('roleId') roleId: string) {
    return await this.rolePermissionService.getByRole(roleId);
  }
}
