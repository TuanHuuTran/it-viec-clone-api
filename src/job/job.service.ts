import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateJobDto, JobQueryDto, UpdateJobDto } from './dto';
import { RoleType } from '@prisma/client';

@Injectable()
export class JobService {
  constructor(private prismaService: PrismaService) { }

  async create(employerId: string, data: CreateJobDto) {
    const employerProfile = await this.prismaService.employerProfile.findFirst({ where: { userId: employerId } })

    if (!employerProfile) {
      throw new BadRequestException('Employer profile not found. Please complete your employer profile before posting jobs.');
    }

    const location = await this.prismaService.location.findUnique({
      where: { id: data.locationId }
    });

    if (!location) {
      throw new NotFoundException(`Location with ID ${data.locationId} not found`);
    }

    const industry = await this.prismaService.industry.findUnique({
      where: { id: data.industryId }
    });

    if (!industry) {
      throw new NotFoundException(`Industry with ID ${data.industryId} not found`);
    }

    if (data.skills && data.skills.length > 0) {
      const skillIds = data.skills.map(skill => skill.skillId)
      const skills = await this.prismaService.skill.findMany({
        where: { id: { in: skillIds } }
      })

      if (skills.length !== skillIds.length) {
        throw new BadRequestException('One or more skills do not exist');
      }
    }

    if (data.districts && data.districts.length > 0) {
      const districtIds = data.districts.map(district => district.districtId)
      const districts = await this.prismaService.district.findMany({
        where: { id: { in: districtIds } }
      })

      if (districts.length !== districtIds.length) {
        throw new BadRequestException('One or more districts do not exist');
      }

      const invalidDistricts = districts.filter(district => district.locationId !== data.locationId);
      if (invalidDistricts.length > 0) {
        throw new BadRequestException('One or more districts do not belong to the selected location');
      }
    }

    return this.prismaService.job.create({
      data: {
        title: data.title,
        description: data.description,
        requirements: data.requirements,
        benefits: data.benefits,
        level: data.level,
        minSalary: data.minSalary,
        maxSalary: data.maxSalary,
        showSalary: data.showSalary ?? false,
        workingModel: data.workingModel,
        locationId: data.locationId,
        industryId: data.industryId,
        employerId: employerProfile.id,
        skills: data.skills && data.skills.length > 0
          ? {
            create: data.skills.map(skill => ({
              skill: { connect: { id: skill.skillId } }
            }))
          }
          : undefined,
        districts: data.districts && data.districts.length > 0
          ? {
            create: data.districts.map(district => ({
              district: { connect: { id: district.districtId } }
            }))
          }
          : undefined,
      },
      include: {
        location: true,
        industry: true,
        skills: {
          include: {
            skill: true
          }
        },
        districts: {
          include: {
            district: true
          }
        },
        employer: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });
  }

  async findAll(queryDto: JobQueryDto) {
    const {
      query,
      levels,
      minSalary,
      maxSalary,
      workingModels,
      locationIds,
      industryIds,
      skillIds,
      districtIds,
      isActive,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = queryDto;

    const where: any = {};

    if (query) {
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { requirements: { contains: query, mode: 'insensitive' } },
        { benefits: { contains: query, mode: 'insensitive' } }
      ];
    }

    if (levels && levels.length > 0) {
      where.level = { in: levels };
    }

    if (minSalary !== undefined) {
      where.minSalary = { gte: minSalary };
    }
    if (maxSalary !== undefined) {
      where.maxSalary = { lte: maxSalary };
    }

    if (workingModels && workingModels.length > 0) {
      where.workingModel = { in: workingModels };
    }

    if (locationIds && locationIds.length > 0) {
      where.locationId = { in: locationIds };
    }

    if (industryIds && industryIds.length > 0) {
      where.industryId = { in: industryIds };
    }

    if (skillIds && skillIds.length > 0) {
      where.skills = {
        some: {
          skillId: { in: skillIds }
        }
      };
    }

    if (districtIds && districtIds.length > 0) {
      where.districts = {
        some: {
          districtId: { in: districtIds }
        }
      };
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const skip = (page - 1) * limit;

    const orderBy = { [sortBy]: sortOrder };

    const [jobs, total] = await Promise.all([
      this.prismaService.job.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          location: true,
          industry: true,
          skills: {
            include: {
              skill: true
            }
          },
          districts: {
            include: {
              district: true
            }
          },
          employer: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          }
        }
      }),
      this.prismaService.job.count({ where })
    ]);

    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;
    return {
      data: jobs,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage,
        hasPrevPage
      }
    };
  }

  async findOne(id: string) {
    return this.prismaService.job.findUnique({
      where: { id },
      include: {
        skills: {
          select: {
            skill: {
              select: {
                name: true
              }
            }
          }
        },
        employer: {
          select: {
            companyName: true,
            logoUrl: true
          }
        },
        location: {
          select: {
            name: true
          }
        }
      }
    })
  }

  async update(id: string, updateJobDto: UpdateJobDto, userId: string, userRole: RoleType[]) {
    const job = await this.prismaService.job.findFirst({
      where: {
        id,
        isActive: true
      },
      include: {
        employer: true
      }
    })

    if (!job) {
      throw new NotFoundException(`Job with ID ${id} not found`);
    }

    const isAdmin = userRole.includes(RoleType.ADMIN)

    if (!isAdmin && job.employer.userId !== userId) {
      throw new ForbiddenException('You do not have permission to update this job');
    }

    const updateData: any = { ...updateJobDto };

    if (updateJobDto.locationId) {
      const location = await this.prismaService.location.findUnique({
        where: { id: updateJobDto.locationId }
      });

      if (!location) {
        throw new NotFoundException(`Location with ID ${updateJobDto.locationId} not found`);
      }

      if (updateJobDto.districts && updateJobDto.districts.length > 0) {
        const districtIds = updateJobDto.districts.map(d => d.districtId);
        const districts = await this.prismaService.district.findMany({
          where: { id: { in: districtIds } }
        });

        const invalidDistricts = districts.filter(d => d.locationId !== updateJobDto.locationId);
        if (invalidDistricts.length > 0) {
          throw new BadRequestException('One or more districts do not belong to the selected location');
        }
      }
    } else if (updateJobDto.districts && updateJobDto.districts.length > 0) {
      const districtIds = updateJobDto.districts.map(d => d.districtId);
      const districts = await this.prismaService.district.findMany({
        where: { id: { in: districtIds } }
      });

      const invalidDistricts = districts.filter(d => d.locationId !== job.locationId);
      if (invalidDistricts.length > 0) {
        throw new BadRequestException('One or more districts do not belong to the job location');
      }
    }

    if (updateJobDto.industryId) {
      const industry = await this.prismaService.industry.findUnique({
        where: { id: updateJobDto.industryId }
      });

      if (!industry) {
        throw new NotFoundException(`Industry with ID ${updateJobDto.industryId} not found`);
      }
    }

    // Validate skills
    if (updateJobDto.skills && updateJobDto.skills.length > 0) {
      const skillIds = updateJobDto.skills.map(skill => skill.skillId);
      const skills = await this.prismaService.skill.findMany({
        where: { id: { in: skillIds } }
      });

      if (skills.length !== skillIds.length) {
        throw new BadRequestException('One or more skills do not exist');
      }
    }

    let skillsUpdateOp;
    let districtsUpdateOp;

    if (updateJobDto.skills !== undefined) {
      await this.prismaService.jobSkill.deleteMany({
        where: { jobId: id }
      });

      if (updateJobDto.skills.length > 0) {
        skillsUpdateOp = {
          create: updateJobDto.skills.map(skill => ({
            skill: { connect: { id: skill.skillId } }
          }))
        };
      }
    }

    if (updateJobDto.districts !== undefined) {
      await this.prismaService.jobDistrict.deleteMany({
        where: { jobId: id }
      });

      if (updateJobDto.districts.length > 0) {
        districtsUpdateOp = {
          create: updateJobDto.districts.map(district => ({
            district: { connect: { id: district.districtId } }
          }))
        };
      }
    }

    delete updateData.skills;
    delete updateData.districts;

    return this.prismaService.job.update({
      where: { id },
      data: {
        ...updateData,
        skills: skillsUpdateOp,
        districts: districtsUpdateOp,
      },
      include: {
        location: true,
        industry: true,
        skills: {
          include: {
            skill: true
          }
        },
        districts: {
          include: {
            district: true
          }
        },
        employer: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });
  }

  async remove(id: string, userId: string, userRole: RoleType[]) {
    const job = await this.prismaService.job.findUnique({
      where: { id },
      include: {
        employer: true
      }
    })

    if (!job) {
      throw new NotFoundException(`Job with ID ${id} not found`);
    }

    const isAdmin = userRole.includes(RoleType.ADMIN)

    if (!isAdmin && job.employer.userId !== userId) {
      throw new ForbiddenException('You do not have permission to delete this job');
    }

    await this.prismaService.job.update({
      where: { id },
      data: {
        isActive: false
      }
    })

    return { message: `Job with ID ${id} has been deleted` };
  }

  async getJobByEmployer(employerId: string) {
    return await this.prismaService.job.findMany({
      where: {
        employer: {
          userId: employerId
        },
        isActive: true
      },
      include: {
        employer: {
          select: {
            id: true,
            companyName: true,
            industry: true
          }
        },
        skills: {
          include: {
            skill: {
              select: {
                name: true
              }
            }
          }
        },
        location: {
          select: {
            name: true
          }
        },
        districts: {
          include: {
            district: {
              select: {
                name: true
              }
            }
          }
        }
      }
    })
  }
}
