import { BadRequestException, ConflictException, ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateEmployerDTO } from './dto';
import { UpdateEmployerDTO } from './dto/update-employer.dto';
import { RoleType, User } from '@prisma/client';

@Injectable()
export class EmployerProfileService {
  constructor(private prismaService: PrismaService) { }
  async create(userId: string, createEmployerDto: CreateEmployerDTO) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} is not exits`);
    }

    const existingProfile = await this.prismaService.employerProfile.findUnique({
      where: { userId },
    });

    if (existingProfile) {
      throw new Error('This user already has an employer profile');
    }

    return this.prismaService.employerProfile.create({
      data: {
        ...createEmployerDto,
        user: {
          connect: { id: userId },
        },
      },
    });
  }

  async findAll() {
    return await this.prismaService.employerProfile.findMany({
      include: {
        user: {
          include: {
            roles: {
              select: {
                role: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        }
      }
    })
  }

  async findOne(id: string) {
    return await this.prismaService.employerProfile.findUnique({
      where: { id }
    })
  }

  async update(id: string, updateDto: UpdateEmployerDTO, owner: any) {
    const employer = await this.prismaService.employerProfile.findUnique({
      where: { id }, include: {
        user: {
          select: {
            id: true
          }
        }
      }
    })

    if (!employer) {
      throw new NotFoundException(`Employer is not found with ID ${id}`)
    }

    const isOwner = employer.user.id === owner.sub;
    const isAdmin = owner.roles.includes(RoleType.ADMIN);

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('User does not have permission to edit')
    }

    return await this.prismaService.employerProfile.update({
      where: { id },
      data: updateDto
    })
  }

  async remove(id: string) {
    const employer = await this.prismaService.employerProfile.findUnique({
      where: { id }
    })

    if (!employer) {
      throw new NotFoundException(`Employer is not found with ID ${id}`)
    }

    try {
      const userWithRoles = await this.prismaService.user.findUnique({
        where: { id: employer.userId },
        include: {
          roles: {
            include: {
              role: true
            }
          }
        }
      })

      if (!userWithRoles) {
        throw new NotFoundException(`UserRole is not found with ID ${employer.userId}`)
      }

      const employerRoles = userWithRoles.roles.filter(r => r.role.name === RoleType.EMPLOYER)

      if (employerRoles.length === 0) {
        throw new NotFoundException(`User does not have EMPLOYER role`);
      }

      const userRoleToDelete = await this.prismaService.userRole.findFirst({
        where: {
          userId: employer.userId,
          role: {
            name: RoleType.EMPLOYER
          }
        }
      })

      return await this.prismaService.$transaction(async (tx) => {
        if (userRoleToDelete) {
          await tx.userRole.delete({ where: { id: userRoleToDelete.id } })
          await tx.employerProfile.delete({ where: { id } })
          return { message: `Employer with ID ${id} was deleted` };
        }
      })
    } catch (error) {
      throw new InternalServerErrorException(`Failed to delete employer: ${error.message}`);
    }
  }
}
