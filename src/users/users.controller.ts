import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { RoleType, User } from '@prisma/client';
import { RequirePermission } from 'src/auth/decorator/auth.require-permission.decorator';
import { RequireRoles } from 'src/auth/decorator/auth.require-role.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/auth/guards/role-permission.guard';
import { RolesGuard } from 'src/auth/guards/role.guard';
import { UsersService } from './users.service';
import { AssignRoleDTO, CreateUserDTO, UpdateUserDTO } from './dto';
import { GetUser } from 'src/auth/decorator/auth.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private userService: UsersService) { }

  @UseGuards(RolesGuard, PermissionsGuard)
  @RequireRoles(RoleType.ADMIN)
  @RequirePermission()
  @Post()
  async create(@GetUser('sub') sub: string, @Body() createUserDto: CreateUserDTO) {
    return await this.userService.create(sub, createUserDto)
  }

  @UseGuards(PermissionsGuard)
  @RequirePermission('users:read')
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.userService.findOne(id)
  }

  @UseGuards(PermissionsGuard)
  @RequirePermission('users:read')
  @Get()
  async findAll() {
    return await this.userService.findAll()
  }

  @UseGuards(PermissionsGuard)
  @RequirePermission('users:update')
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDTO) {
    return await this.userService.update(id, updateUserDto)
  }

  @UseGuards(RolesGuard)
  @RequireRoles(RoleType.ADMIN)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return await this.userService.remove(id)
  }

  @UseGuards(RolesGuard)
  @RequireRoles(RoleType.ADMIN)
  @Post(':id/roles')
  async assignRole(@GetUser('sub') sub: string, @Param('id') id: string, @Body() assignRoleDto: AssignRoleDTO) {
    return await this.userService.assignRole(sub, id, assignRoleDto)
  }

  @UseGuards(RolesGuard)
  @RequireRoles(RoleType.ADMIN)
  @Delete(':id/roles/:roleId')
  async removeRole(@Param('id') id: string, @Param('roleId') roleId: string) {
    return await this.userService.removeRole(id, roleId)
  }

  @UseGuards(PermissionsGuard)
  @RequirePermission('users:read')
  @Get(':id/roles')
  async getUserRoles(@Param('id') id: string) {
    return await this.userService.getUserRoles(id)
  }
}
