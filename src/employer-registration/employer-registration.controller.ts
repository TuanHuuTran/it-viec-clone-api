import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { EmployerRegistrationService } from './employer-registration.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { GetUser } from 'src/auth/decorator/auth.decorator';
import { CreateEmployerRegistrationDTO, UpdateStatusDTO } from './dto';
import { RequireRoles } from 'src/auth/decorator/auth.require-role.decorator';
import { RoleType } from '@prisma/client';
import { RolesGuard } from 'src/auth/guards/role.guard';
import { AssignRoleDTO } from 'src/users/dto';

@Controller('employer-registrations')

export class EmployerRegistrationController {
  constructor(private employerRegistrationService: EmployerRegistrationService) { }

  @Post('register-as-employer')
  @UseGuards(JwtAuthGuard)
  async registerAsEmployer(
    @GetUser('sub') userId: string,
    @Body() employerRegistrationDto: CreateEmployerRegistrationDTO
  ) {
    return this.employerRegistrationService.registerAsEmployer(userId, employerRegistrationDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequireRoles(RoleType.ADMIN)
  async findAll() {
    return await this.employerRegistrationService.findAll()
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequireRoles(RoleType.ADMIN)
  async findOne(@Param('id') id: string) {
    return await this.employerRegistrationService.findOne(id)
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequireRoles(RoleType.ADMIN)
  async updateStatus(@Param('id') id: string, @GetUser('sub') sub: string, @Body() updateStatusDto: UpdateStatusDTO) {
    return await this.employerRegistrationService.updateStatus(id, sub, updateStatusDto)
  }

}
