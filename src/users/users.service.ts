import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDTO } from './dto/create-user.dto';
import { AuthService } from 'src/auth/auth.service';
import { AssignRoleDTO, UpdateUserDTO } from './dto';

@Injectable()
export class UsersService {
  constructor(
    private prismaService: PrismaService,
    private authService: AuthService
  ) { }

  async create(sub: string, createUserDto: CreateUserDTO) {
    const exitsUser = await this.prismaService.user.findUnique({
      where: { email: createUserDto.email }
    })

    if (exitsUser) {
      throw new ConflictException('email already exits in system')
    }

    const hashedPassword = await this.authService.hashPassword(createUserDto.password)
    const user = await this.prismaService.user.create({
      data: {
        email: createUserDto.email,
        password: hashedPassword,
        name: createUserDto.name,
        tokenVersion: 0,
      },
      select: {
        id: true,
        email: true,
        name: true
      }
    })

    if (createUserDto.role) {
      const roleId = await this.authService.checkRole(createUserDto.role)
      await this.prismaService.userRole.create({
        data: {
          userId: user.id,
          roleId: roleId,
          assignedBy: sub
        }
      })
    }

    return user
  }

  async findOne(id: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id: id },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        roles: {
          include: {
            role: true
          }
        }
      }
    })

    if (!user) {
      throw new NotFoundException('user not found')
    }

    return user
  }

  async findAll() {
    const users = await this.prismaService.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        roles: {
          include: {
            role: true
          }
        }
      }
    })

    return { users }
  }

  async update(id: string, updateUserDto: UpdateUserDTO) {
    const exitsUser = await this.prismaService.user.findUnique({
      where: { id: id }
    })

    if (!exitsUser) {
      throw new NotFoundException('User not found')
    }

    let data: any = { ...updateUserDto }
    if (updateUserDto.password) {
      data.password = this.authService.hashPassword(updateUserDto.password)
    }

    const updateUser = await this.prismaService.user.update({
      where: { id: id },
      data
    })

    const { password, ...result } = updateUser
    return result
  }

  async remove(id: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id: id }
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    await this.prismaService.user.delete({
      where: { id }
    });

    return { message: `User with ID ${id} was deleted` };
  }

  async assignRole(sub: string, id: string, assignRoleDto: AssignRoleDTO) {
    const user = await this.prismaService.user.findUnique({
      where: { id }
    })

    if (!user) {
      throw new BadRequestException('User not found')
    }

    const roleId = await this.authService.checkRole(assignRoleDto.role)

    if (!roleId) {
      throw new NotFoundException(`Role with  name ${assignRoleDto.role} not found`);
    }

    try {
      return await this.prismaService.userRole.create({
        data: {
          userId: user.id,
          roleId: roleId,
          assignedBy: sub
        }
      })
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException(`User already has this role`);
      }
      throw error;
    }
  }

  async removeRole(userId: string, roleId: string) {
    const userRole = await this.prismaService.userRole.findFirst({
      where: { userId, roleId },
    });

    if (!userRole) {
      throw new NotFoundException(`User does not have this role`);
    }

    await this.prismaService.userRole.delete({
      where: { id: userRole.id },
    });

    return { message: `Role was removed from user` };
  }

  async getUserRoles(id: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id: id },
      include: {
        roles: {
          include: {
            role: true
          }
        }
      }
    })

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user.roles.map(userRole => userRole.role);
  }
}
