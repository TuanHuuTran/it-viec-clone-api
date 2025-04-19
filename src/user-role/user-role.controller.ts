import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { UserRoleService } from './user-role.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/auth/guards/role-permission.guard';
import { RequirePermission } from 'src/auth/decorator/auth.require-permission.decorator';
import { RolesGuard } from 'src/auth/guards/role.guard';
import { RoleType } from '@prisma/client';
import { RequireRoles } from 'src/auth/decorator/auth.require-role.decorator';
import { CreateUserRoleDTO, UpdateUserRoleDTO } from './dto';
import { GetUser } from 'src/auth/decorator/auth.decorator';

@Controller('user-roles')
@UseGuards(JwtAuthGuard)
export class UserRoleController {
  constructor(private userRoleService: UserRoleService) { }

  @Post()
  @UseGuards(RolesGuard)
  @RequireRoles(RoleType.ADMIN)
  async create(@Body() createUserRoleDto: CreateUserRoleDTO, @GetUser('sub') currentUserId: string) {
    return await this.userRoleService.create(createUserRoleDto, currentUserId)
  }

  @Get()
  @UseGuards(PermissionsGuard)
  @RequirePermission('roles:read')
  async findAll() {
    return await this.userRoleService.findAll()
  }

  @Get(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermission('roles:read')
  async findOne(@Param('id') id: string) {
    return await this.userRoleService.findOne(id)
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @RequireRoles(RoleType.ADMIN)
  async update(@Param('id') id: string, @Body() updateUserRoleDto: UpdateUserRoleDTO) {
    return await this.userRoleService.update(id, updateUserRoleDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @RequireRoles(RoleType.ADMIN)
  async remove(@Param('id') id: string) {
    return await this.userRoleService.remove(id);
  }

  @Get('user/:userId/role/:roleId')
  @UseGuards(PermissionsGuard)
  @RequirePermission('roles:read')
  async findByUserAndRole(@Param('userId') userId: string, @Param('roleId') roleId: string) {
    return await this.userRoleService.findByUserAndRole(userId, roleId);
  }
}
