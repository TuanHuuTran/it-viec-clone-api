import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { PermissionService } from './permission.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/auth/guards/role-permission.guard';
import { RequirePermission } from 'src/auth/decorator/auth.require-permission.decorator';
import { RolesGuard } from 'src/auth/guards/role.guard';
import { RequireRoles } from 'src/auth/decorator/auth.require-role.decorator';
import { RoleType } from '@prisma/client';
import { CreatePermissionDTO, UpdatePermissionDTO } from './dto';

@Controller('permissions')
@UseGuards(JwtAuthGuard)
export class PermissionController {
  constructor(private permissionService: PermissionService) { }

  @Get()
  @UseGuards(PermissionsGuard)
  @RequirePermission('permissions:read')
  async findAll() {
    return await this.permissionService.findAll()
  }

  @Get(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermission('permissions:read')
  async findOne(@Param('id') id: string) {
    return await this.permissionService.findOne(id)
  }

  @Post()
  @UseGuards(RolesGuard)
  @RequireRoles(RoleType.ADMIN)
  async findByCode(@Body() createPermissionDto: CreatePermissionDTO) {
    return await this.permissionService.create(createPermissionDto)
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @RequireRoles(RoleType.ADMIN)
  async update(@Param('id') id: string, @Body() updatePermissionDto: UpdatePermissionDTO) {
    return await this.permissionService.update(id, updatePermissionDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @RequireRoles(RoleType.ADMIN)
  async remove(@Param('id') id: string) {
    return await this.permissionService.remove(id);
  }

  @Get(':id/roles')
  @UseGuards(PermissionsGuard)
  @RequirePermission('permissions:read')
  async getPermissionRoles(@Param('id') id: string) {
    return await this.permissionService.getPermissionRoles(id);
  }
}
