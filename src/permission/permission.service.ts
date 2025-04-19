import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePermissionDTO, UpdatePermissionDTO } from './dto';

@Injectable()
export class PermissionService {
  constructor(private prismaService: PrismaService) { }

  async findAll() {
    return await this.prismaService.permission.findMany()
  }

  async findOne(id: string) {
    const permission = await this.prismaService.permission.findUnique({
      where: { id },
    });

    if (!permission) {
      throw new NotFoundException(`Permission with ID ${id} not found`);
    }

    return permission;
  }

  async create(createPermissionDto: CreatePermissionDTO) {
    try {
      return await this.prismaService.permission.create({
        data: createPermissionDto,
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Permission with this name or code already exists');
      }
      throw error;
    }
  }

  async update(id: string, updatePermissionDto: UpdatePermissionDTO) {
    const permission = await this.prismaService.permission.findUnique({
      where: { id },
    });

    if (!permission) {
      throw new NotFoundException(`Permission with ID ${id} not found`);
    }

    return this.prismaService.permission.update({
      where: { id },
      data: updatePermissionDto,
    });
  }

  async remove(id: string) {
    const permission = await this.prismaService.permission.findUnique({
      where: { id },
    });

    if (!permission) {
      throw new NotFoundException(`Permission with ID ${id} not found`);
    }

    await this.prismaService.permission.delete({
      where: { id },
    });

    return { message: `Permission with ID ${id} was deleted` };
  }

  async getPermissionRoles(id: string) {
    const permission = await this.prismaService.permission.findUnique({
      where: { id },
      include: {
        roles: {
          include: {
            role: true
          }
        }
      }
    })

    if (!permission) {
      throw new NotFoundException(`Permission with ID ${id} not found`);
    }

    return permission.roles.map(r => r.role)
  }
}
