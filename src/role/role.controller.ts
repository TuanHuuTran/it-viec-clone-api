import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { RoleService } from './role.service';
import { AssignPermissionDTO, CreateRoleDTO, UpdateRoleDTO } from './dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/role.guard';
import { RequireRoles } from 'src/auth/decorator/auth.require-role.decorator';
import { RoleType } from '@prisma/client';
import { PermissionsGuard } from 'src/auth/guards/role-permission.guard';
import { RequirePermission } from 'src/auth/decorator/auth.require-permission.decorator';

@Controller('roles')
@UseGuards(JwtAuthGuard)
export class RoleController {
  constructor(private roleService: RoleService) { }

  @Post()
  @UseGuards(RolesGuard)
  @RequireRoles(RoleType.ADMIN)
  async create(@Body() createRoleDto: CreateRoleDTO) {
    return this.roleService.create(createRoleDto)
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @RequireRoles(RoleType.ADMIN)
  async update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDTO) {
    return this.roleService.update(id, updateRoleDto)
  }

  @Get()
  @UseGuards(RolesGuard)
  @RequireRoles(RoleType.ADMIN)
  async findAll() {
    return this.roleService.findAll()
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @RequireRoles(RoleType.ADMIN)
  async findOne(@Param('id') id: string) {
    return this.roleService.findOne(id)
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @RequireRoles(RoleType.ADMIN)
  async remove(@Param('id') id: string) {
    return await this.roleService.remove(id);
  }

  @Get(':id/users')
  @UseGuards(PermissionsGuard)
  @RequirePermission('roles:read')
  async getRoleUsers(@Param('id') id: string) {
    return this.roleService.getRoleUsers(id);
  }

  @Post(':id/permission')
  @UseGuards(RolesGuard)
  @RequireRoles(RoleType.ADMIN)
  async assignPermission(@Param('id') id: string, @Body() assignPermissionDto: AssignPermissionDTO) {
    return await this.roleService.assignPermission(id, assignPermissionDto.permissionId)
  }

  @Delete(':id/permission/:permissionId')
  @UseGuards(RolesGuard)
  @RequireRoles(RoleType.ADMIN)
  async removePermission(@Param('id') id: string, @Param('permissionId') permissionId: string) {
    return await this.roleService.removePermission(id, permissionId)
  }

  @Get(':id/permission')
  @UseGuards(PermissionsGuard)
  @RequirePermission('roles:read')
  async getRolePermission(@Param('id') id: string) {
    return this.roleService.getRolePermission(id);
  }
}
