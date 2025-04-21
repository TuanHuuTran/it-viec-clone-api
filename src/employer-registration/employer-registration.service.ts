import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateEmployerRegistrationDTO, UpdateStatusDTO } from './dto';
import { RoleType } from '@prisma/client';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class EmployerRegistrationService {
  constructor(private prismaService: PrismaService, private authService: AuthService) { }

  async registerAsEmployer(userId: string, employerRegistrationDto: CreateEmployerRegistrationDTO) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      include: { roles: { include: { role: true } } }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isEmployer = user.roles.some(ur => ur.role.name === RoleType.EMPLOYER);
    if (isEmployer) {
      throw new ConflictException('User has the role of recruiter');
    }

    const registration = await this.prismaService.employerRegistration.create({
      data: {
        userId: userId,
        companyName: employerRegistrationDto.companyName,
        companyAddress: employerRegistrationDto.companyAddress,
        website: employerRegistrationDto.website,
        contactPerson: employerRegistrationDto.contactPerson,
        contactEmail: employerRegistrationDto.contactEmail,
        contactPhone: employerRegistrationDto.contactPhone,
        status: 'PENDING'
      }
    });

    return {
      message: 'Registered as employer successfully, please wait for admin approval',
      registrationId: registration.id
    };
  }

  async findAll() {
    return this.prismaService.employerRegistration.findMany({
      include: {
        user: true
      }
    })
  }

  async findOne(id: string) {
    return this.prismaService.employerRegistration.findUnique({
      where: { id },
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

  async updateStatus(id: string, sub: string, updateStatusDto: UpdateStatusDTO) {
    const registration = await this.prismaService.employerRegistration.findUnique({
      where: { id }
    });

    if (!registration) {
      throw new NotFoundException(`Registration not found with id ${id}`);
    }

    if (!registration.userId) {
      throw new BadRequestException('Registration does not have a valid user ID');
    }

    const notes = updateStatusDto.status === 'APPROVED'
      ? 'Your request has been approved.'
      : 'Your request has been rejected.';

    const updateData = {
      status: updateStatusDto.status,
      notes: updateStatusDto.notes || notes,
      processedBy: sub,
      processedAt: new Date()
    };

    if (updateStatusDto.status === 'REJECTED') {
      return await this.prismaService.employerRegistration.update({
        where: { id },
        data: updateData
      })
    } else {
      try {
        const result = await this.prismaService.$transaction(async (tx) => {
          const updatedRegistration = await tx.employerRegistration.update({
            where: { id },
            data: updateData
          });

          const roleId = await this.authService.checkRole(updateStatusDto.role);

          if (!roleId) {
            throw new NotFoundException(`Role with name ${updateStatusDto.role} not found`);
          }

          const existingUserRole = await tx.userRole.findFirst({
            where: {
              userId: registration.userId,
              roleId: roleId
            }
          });

          let userRole;
          if (existingUserRole) {
            userRole = existingUserRole;
          } else {
            userRole = await tx.userRole.create({
              data: {
                userId: registration.userId,
                roleId: roleId,
                assignedBy: sub
              }
            });
          }

          return {
            registration: updatedRegistration,
            userRole
          };
        });

        return result;
      } catch (error) {
        if (error.code === 'P2002') {
          throw new ConflictException(`User already has this role`);
        }
        throw error;
      }
    }
  }
}
