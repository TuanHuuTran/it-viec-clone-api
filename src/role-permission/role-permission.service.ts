import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateRolePermissionDTO } from './dto';

@Injectable()
export class RolePermissionService {
  constructor(private prismaService: PrismaService) { }

  async create(createRolePermissionDto: CreateRolePermissionDTO) {
    const role = await this.prismaService.role.findUnique({
      where: { id: createRolePermissionDto.roleId },
    });

    if (!role) {
      throw new NotFoundException(`Role with ID ${createRolePermissionDto.roleId} not found`);
    }

    const permission = await this.prismaService.permission.findUnique({
      where: { id: createRolePermissionDto.permissionId },
    });

    if (!permission) {
      throw new NotFoundException(`Permission with ID ${createRolePermissionDto.permissionId} not found`);
    }

    try {
      return await this.prismaService.rolePermission.create({
        data: createRolePermissionDto,
        include: {
          role: true,
          permission: true,
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Role already has this permission');
      }
      throw error;
    }
  }

  async findAll() {
    return await this.prismaService.rolePermission.findMany({
      include: {
        role: true,
        permission: true,
      },
    })
  }

  async findOne(id: string) {
    const rolePermission = await this.prismaService.rolePermission.findUnique({
      where: { id },
      include: {
        role: true,
        permission: true,
      },
    });

    if (!rolePermission) {
      throw new NotFoundException(`RolePermission with ID ${id} not found`);
    }

    return rolePermission;
  }

  async remove(id: string) {
    const rolePermission = await this.prismaService.rolePermission.findUnique({
      where: { id },
    });

    if (!rolePermission) {
      throw new NotFoundException(`RolePermission with ID ${id} not found`);
    }

    await this.prismaService.rolePermission.delete({
      where: { id },
    });

    return { message: `RolePermission with ID ${id} was deleted` };
  }

  async findByRoleAndPermission(roleId: string, permissionId: string) {
    const rolePermission = await this.prismaService.rolePermission.findFirst({
      where: {
        roleId,
        permissionId,
      },
      include: {
        role: true,
        permission: true,
      },
    });

    if (!rolePermission) {
      throw new NotFoundException(`RolePermission for role ${roleId} and permission ${permissionId} not found`);
    }

    return rolePermission;
  }

  async getByPermission(permissionId: string) {
    const permission = await this.prismaService.permission.findUnique({
      where: { id: permissionId },
    });

    if (!permission) {
      throw new NotFoundException(`Permission with ID ${permissionId} not found`);
    }

    return this.prismaService.rolePermission.findMany({
      where: { permissionId },
      include: {
        role: true,
      },
    });
  }

  async getByRole(roleId: string) {
    const role = await this.prismaService.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      throw new NotFoundException(`Role with ID ${roleId} not found`);
    }

    return this.prismaService.rolePermission.findMany({
      where: { roleId },
      include: {
        permission: true,
      },
    });
  }
}
