import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JobService } from './job.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/role.guard';
import { RequireRoles } from 'src/auth/decorator/auth.require-role.decorator';
import { RoleType } from '@prisma/client';
import { CreateJobDto, JobQueryDto, UpdateJobDto } from './dto';
import { GetUser } from 'src/auth/decorator/auth.decorator';

@Controller('jobs')

export class JobController {
  constructor(private jobService: JobService) { }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequireRoles(RoleType.EMPLOYER)

  async create(@GetUser('sub') sub: string, @Body() dataCreate: CreateJobDto) {
    return await this.jobService.create(sub, dataCreate)
  }

  @Get()
  async findAll(@Query() queryDto: JobQueryDto) {
    return await this.jobService.findAll(queryDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.jobService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequireRoles(RoleType.EMPLOYER, RoleType.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateJobDto,
    @GetUser('sub') userId: string,
    @GetUser('roles') userRoles: RoleType[]) {
    return this.jobService.update(id, updateDto, userId, userRoles)
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequireRoles(RoleType.EMPLOYER, RoleType.ADMIN)
  async remove(@Param('id') id: string, @GetUser('sub') userId: string, @GetUser('roles') userRoles: RoleType[]) {
    return this.jobService.remove(id, userId, userRoles)
  }

  @Get('/employer-job/:employerId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequireRoles(RoleType.EMPLOYER, RoleType.ADMIN)
  async getJobByEmployer(@Param('employerId') employerId: string) {
    return this.jobService.getJobByEmployer(employerId)
  }
}
