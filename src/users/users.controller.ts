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

  @Post()
  @UseGuards(RolesGuard)
  @RequireRoles(RoleType.ADMIN)
  async create(@GetUser('sub') sub: string, @Body() createUserDto: CreateUserDTO) {
    return await this.userService.create(sub, createUserDto)
  }

  @Get(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermission('users:read')
  async findOne(@Param('id') id: string) {
    return await this.userService.findOne(id)
  }

  @Get()
  @UseGuards(PermissionsGuard)
  @RequirePermission('users:read')
  async findAll() {
    return await this.userService.findAll()
  }

  @Patch(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermission('users:update')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDTO) {
    return await this.userService.update(id, updateUserDto)
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @RequireRoles(RoleType.ADMIN)
  async delete(@Param('id') id: string) {
    return await this.userService.remove(id)
  }

  @Post(':id/roles')
  @UseGuards(RolesGuard)
  @RequireRoles(RoleType.ADMIN)
  async assignRole(@GetUser('sub') sub: string, @Param('id') id: string, @Body() assignRoleDto: AssignRoleDTO) {
    return await this.userService.assignRole(sub, id, assignRoleDto)
  }

  @Delete(':id/roles/:roleId')
  @UseGuards(RolesGuard)
  @RequireRoles(RoleType.ADMIN)
  async removeRole(@Param('id') id: string, @Param('roleId') roleId: string) {
    return await this.userService.removeRole(id, roleId)
  }

  @Get(':id/roles')
  @UseGuards(PermissionsGuard)
  @RequirePermission('users:read')
  async getUserRoles(@Param('id') id: string) {
    return await this.userService.getUserRoles(id)
  }
}
