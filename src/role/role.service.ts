import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AssignPermissionDTO, CreateRoleDTO, UpdateRoleDTO } from './dto';
import { UpdateUserDTO } from 'src/users/dto';

@Injectable()
export class RoleService {
  constructor(private prismaService: PrismaService) { }

  async create(createRoleDto: CreateRoleDTO) {
    try {
      return await this.prismaService.role.create({
        data: createRoleDto,
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Role with this name already exists');
      }
      throw error;
    }
  }

  async update(id: string, updateRoleDto: UpdateRoleDTO) {
    const role = await this.prismaService.role.findUnique({
      where: { id },
    });

    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }

    return this.prismaService.role.update({
      where: { id },
      data: updateRoleDto
    });
  }

  async findAll() {
    return this.prismaService.role.findMany({
      include: {
        permissions: {
          include: {
            permission: {
              select: {
                code: true
              }
            }
          }
        }
      }
    })
  }

  async findOne(id: string) {
    return await this.prismaService.role.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        permissions: {
          include: {
            permission: {
              select: {
                code: true
              }
            }
          }
        }
      },
    })
  }

  async remove(id: string) {
    const role = await this.prismaService.role.findUnique({
      where: { id },
    });

    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }

    await this.prismaService.role.delete({
      where: { id },
    });

    return { message: `Role with ID ${id} was deleted` };
  }

  async getRoleUsers(roleId: string) {
    const role = await this.prismaService.role.findUnique({
      where: { id: roleId }
    })

    if (!role) {
      throw new NotFoundException(`Role with ID ${roleId} not found`)
    }

    const userRoles = await this.prismaService.userRole.findMany({
      where: { roleId },
      select: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            createdAt: true,
            updatedAt: true,
          }
        }
      }
    })
    return userRoles.map(user => user.user)
  }

  async assignPermission(roleId: string, permissionId: string) {
    const role = await this.prismaService.role.findUnique({
      where: { id: roleId }
    })

    if (!role) {
      throw new NotFoundException(`Role with ID ${roleId} not found`)
    }

    const permission = await this.prismaService.permission.findUnique({
      where: { id: permissionId }
    })

    if (!permission) {
      throw new NotFoundException(`Permission with ID ${permissionId} not found`)
    }

    try {
      return await this.prismaService.rolePermission.create({
        data: {
          roleId: role.id,
          permissionId: permission.id
        }
      })
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException(`Role already has this permission`);
      }
      throw error
    }
  }

  async removePermission(roleId: string, permissionId: string) {
    const rolePermission = await this.prismaService.rolePermission.findFirst({
      where: { roleId, permissionId }
    })

    if (!rolePermission) {
      throw new NotFoundException(`Role does not have this permission`);
    }

    await this.prismaService.rolePermission.delete({
      where: { id: rolePermission.id },
    });

    return { message: `Permission was removed from role` };
  }

  async getRolePermission(roleId: string) {
    const role = await this.prismaService.role.findUnique({
      where: { id: roleId },
      include: {
        permissions: {
          include: {
            permission: true
          }
        }
      }
    })

    if (!role) {
      throw new NotFoundException(`Role with ID ${roleId} not found`);
    }

    return role.permissions.map(ps => ps.permission)
  }
}
