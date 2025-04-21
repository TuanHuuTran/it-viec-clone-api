import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { EmployerProfileService } from './employer-profile.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/role.guard';
import { RequireRoles } from 'src/auth/decorator/auth.require-role.decorator';
import { RoleType, User } from '@prisma/client';
import { CreateEmployerDTO } from './dto';
import { GetUser } from 'src/auth/decorator/auth.decorator';
import { PermissionsGuard } from 'src/auth/guards/role-permission.guard';
import { RequirePermission } from 'src/auth/decorator/auth.require-permission.decorator';
import { UpdateEmployerDTO } from './dto/update-employer.dto';

@Controller('employers')
@UseGuards(JwtAuthGuard)
export class EmployerProfileController {
  constructor(private employerProfileService: EmployerProfileService) { }


  @Post()
  @UseGuards(PermissionsGuard)
  @RequirePermission('employers:create')
  async create(@GetUser('sub') sub: string, @Body() createEmployerDto: CreateEmployerDTO) {
    return await this.employerProfileService.create(sub, createEmployerDto)
  }

  @Get()
  @UseGuards(PermissionsGuard)
  @RequirePermission('employers:read')
  async findAll() {
    return await this.employerProfileService.findAll()
  }

  @Get(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermission('employers:read')
  async findOne(@Param('id') id: string) {
    return await this.employerProfileService.findOne(id)
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @RequireRoles(RoleType.ADMIN, RoleType.EMPLOYER)
  async update(@Param('id') id: string, @Body() updateDto: UpdateEmployerDTO, @GetUser() user: any) {
    return await this.employerProfileService.update(id, updateDto, user)
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @RequireRoles(RoleType.ADMIN)
  async remove(@Param('id') id: string) {
    return await this.employerProfileService.remove(id)
  }
}
