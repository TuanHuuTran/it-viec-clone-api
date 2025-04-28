import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCandidateProfileDto } from './dto';
import { RoleType } from '@prisma/client';

@Injectable()
export class CandidateProfileService {
  constructor(private prismaService: PrismaService) { }

  async create(userId: string, createCandidateProfileDto: CreateCandidateProfileDto) {
    const user = await this.prismaService.user.findUnique({ where: { id: userId } })

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`)
    }

    const existingProfile = await this.prismaService.candidateProfile.findUnique({
      where: { userId }
    })

    if (existingProfile) {
      throw new BadRequestException('User already account in systems');
    }

    return this.prismaService.candidateProfile.create({
      data: {
        user: { connect: { id: userId } },
        title: createCandidateProfileDto.title,
        bio: createCandidateProfileDto.bio,
        phone: createCandidateProfileDto.phone,
        dateOfBirth: createCandidateProfileDto.dateOfBirth ? new Date(createCandidateProfileDto.dateOfBirth) : undefined,
        gender: createCandidateProfileDto.gender,
        address: createCandidateProfileDto.address,
        location: createCandidateProfileDto.location,
        avatarUrl: createCandidateProfileDto.avatarUrl,
        coverImageUrl: createCandidateProfileDto.coverImageUrl,
        currentPosition: createCandidateProfileDto.currentPosition,
        yearsOfExperience: createCandidateProfileDto.yearsOfExperience,
        careerLevel: createCandidateProfileDto.careerLevel,
        expectedSalary: createCandidateProfileDto.expectedSalary,
        salaryCurrency: createCandidateProfileDto.salaryCurrency,
        showExpectedSalary: createCandidateProfileDto.showExpectedSalary,
        isOpenToWork: createCandidateProfileDto.isOpenToWork,
        preferredWorkingModel: createCandidateProfileDto.preferredWorkingModel,
        linkedinUrl: createCandidateProfileDto.linkedinUrl,
        githubUrl: createCandidateProfileDto.githubUrl,
        portfolioUrl: createCandidateProfileDto.portfolioUrl
      }
    });
  }

  async findOne(id: string) {
    return this.prismaService.candidateProfile.findUnique({
      where: { id },
      include: {
        educations: true,
        workExperiences: true,
        skills: true,
        projects: true,
        certificates: true,
        awards: true,
        resumes: true
      }
    })
  }

  async findAll() {
    return this.prismaService.candidateProfile.findMany();
  }

  async remove(id: string, userId: string, userRole: RoleType) {
    const candidateProfile = await this.prismaService.candidateProfile.findUnique({
      where: { id }
    })

    if (!candidateProfile) {
      throw new NotFoundException(`Candidate profile with ID ${id} not found`);
    }

    if (candidateProfile.userId !== userId || !userRole.includes(RoleType.ADMIN)) {
      throw new ForbiddenException('You do not have permission to delete this profile');
    }

    await this.prismaService.candidateProfile.delete({
      where: { id: candidateProfile.id }
    })

    return { message: `Candidate profile with ID ${id} was successfully deleted` };
  }
}
