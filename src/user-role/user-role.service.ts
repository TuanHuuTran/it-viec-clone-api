import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserRoleDTO, UpdateUserRoleDTO } from './dto';

@Injectable()
export class UserRoleService {
  constructor(private prismaService: PrismaService) { }

  async create(createUserRoleDto: CreateUserRoleDTO, currentUserId: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id: createUserRoleDto.userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${createUserRoleDto.userId} not found`);
    }

    const role = await this.prismaService.role.findUnique({
      where: { id: createUserRoleDto.roleId },
    });

    if (!role) {
      throw new NotFoundException(`Role with ID ${createUserRoleDto.roleId} not found`);
    }
    try {
      return await this.prismaService.userRole.create({
        data: {
          roleId: createUserRoleDto.roleId,
          userId: createUserRoleDto.userId,
          assignedBy: currentUserId
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            }
          },
          role: true
        }
      })
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('User already has this role');
      }
      throw error
    }
  }

  async findAll() {
    return await this.prismaService.userRole.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        role: true,
      }
    })
  }

  async findOne(id: string) {
    return await this.prismaService.userRole.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        role: true,
      }
    })
  }

  async update(id: string, updateUserRoleDto: UpdateUserRoleDTO) {
    const userRole = await this.prismaService.userRole.findUnique({
      where: { id },
    });

    if (!userRole) {
      throw new NotFoundException(`UserRole with ID ${id} not found`);
    }

    return this.prismaService.userRole.update({
      where: { id },
      data: updateUserRoleDto,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        role: true,
      },
    });
  }

  async remove(id: string) {
    const userRole = await this.prismaService.userRole.findUnique({
      where: { id },
    });

    if (!userRole) {
      throw new NotFoundException(`UserRole with ID ${id} not found`);
    }

    await this.prismaService.userRole.delete({
      where: { id },
    });

    return { message: `UserRole with ID ${id} was deleted` };
  }

  async findByUserAndRole(userId: string, roleId: string) {
    const userRole = await this.prismaService.userRole.findFirst({
      where: { userId, roleId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        },
        role: true
      }
    })

    if (!userRole) {
      throw new NotFoundException(`UserRole for user ${userId} and role ${roleId} not found`);
    }

    return userRole;
  }
}
