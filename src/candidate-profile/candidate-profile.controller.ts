import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CandidateProfileService } from './candidate-profile.service';
import { RolesGuard } from 'src/auth/guards/role.guard';
import { RequireRoles } from 'src/auth/decorator/auth.require-role.decorator';
import { RoleType } from '@prisma/client';
import { GetUser } from 'src/auth/decorator/auth.decorator';
import { CreateCandidateProfileDto } from './dto';

@Controller('candidate-profiles')
@UseGuards(JwtAuthGuard)
export class CandidateProfileController {
  constructor(private candidateProfileService: CandidateProfileService) { }

  @Post()
  @UseGuards(RolesGuard)
  @RequireRoles(RoleType.CANDIDATE)
  async create(@GetUser('sub') userId: string, @Body() createDto: CreateCandidateProfileDto) {
    return this.candidateProfileService.create(userId, createDto)
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @RequireRoles(RoleType.CANDIDATE, RoleType.ADMIN)
  async findOne(@Param('id') id: string) {
    return this.candidateProfileService.findOne(id)
  }

  @Get()
  @UseGuards(RolesGuard)
  @RequireRoles(RoleType.ADMIN)
  async findAll() {
    return this.candidateProfileService.findAll()
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @RequireRoles(RoleType.CANDIDATE, RoleType.ADMIN)
  async remove(@Param('id') id: string, @GetUser('sub') userId: string, @GetUser('roles') userRole: RoleType) {
    return this.candidateProfileService.remove(id, userId, userRole)
  }
}
