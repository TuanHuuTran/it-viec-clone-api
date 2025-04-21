import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { RoleType } from '@prisma/client';
import { RequirePermission } from 'src/auth/decorator/auth.require-permission.decorator';
import { RequireRoles } from 'src/auth/decorator/auth.require-role.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/auth/guards/role-permission.guard';
import { RolesGuard } from 'src/auth/guards/role.guard';
import { IndustryService } from './industry.service';
import { CreateIndustryDto, UpdateIndustryDto } from './dto';

@Controller('industries')
@UseGuards(JwtAuthGuard)
export class IndustryController {
  constructor(private industryService: IndustryService) { }

  @Post()
  @UseGuards(RolesGuard)
  @RequireRoles(RoleType.ADMIN)
  async create(@Body() createDto: CreateIndustryDto) {
    return this.industryService.create(createDto);
  }

  @Get()
  @UseGuards(PermissionsGuard)
  @RequirePermission('industries:read')
  async findAll() {
    return this.industryService.findAll();
  }

  @Get(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermission('industries:read')
  async findOne(@Param('id') id: string) {
    return this.industryService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @RequireRoles(RoleType.ADMIN)
  async update(@Param('id') id: string, @Body() updateDto: UpdateIndustryDto) {
    return this.industryService.update(id, updateDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @RequireRoles(RoleType.ADMIN)
  async remove(@Param('id') id: string) {
    return this.industryService.remove(id);
  }

  @Post('batch')
  @UseGuards(RolesGuard)
  @RequireRoles(RoleType.ADMIN)
  async createMany(@Body() createDtos: CreateIndustryDto[]) {
    return this.industryService.createMany(createDtos);
  }
}
