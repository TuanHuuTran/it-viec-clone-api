import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { RoleType } from '@prisma/client';
import { RequirePermission } from 'src/auth/decorator/auth.require-permission.decorator';
import { RequireRoles } from 'src/auth/decorator/auth.require-role.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/auth/guards/role-permission.guard';
import { RolesGuard } from 'src/auth/guards/role.guard';
import { DistrictService } from './district.service';
import { CreateDistrictDto, UpdateDistrictDto } from './dto';

@Controller('districts')
@UseGuards(JwtAuthGuard)
export class DistrictController {
  constructor(private districtService: DistrictService) { }

  @Post()
  @UseGuards(RolesGuard)
  @RequireRoles(RoleType.ADMIN)
  async create(@Body() createDto: CreateDistrictDto) {
    return this.districtService.create(createDto);
  }

  @Post('batch')
  @UseGuards(RolesGuard)
  @RequireRoles(RoleType.ADMIN)
  async createMany(@Body() createDtos: CreateDistrictDto[]) {
    return this.districtService.createMany(createDtos);
  }


  @Get()
  @UseGuards(PermissionsGuard)
  @RequirePermission('districts:read')
  async findAll() {
    return this.districtService.findAll();
  }

  @Get(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermission('districts:read')
  async findOne(@Param('id') id: string) {
    return this.districtService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @RequireRoles(RoleType.ADMIN)
  async update(@Param('id') id: string, @Body() updateDto: UpdateDistrictDto) {
    return this.districtService.update(id, updateDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @RequireRoles(RoleType.ADMIN)
  async remove(@Param('id') id: string) {
    return this.districtService.remove(id);
  }

  @Get('location/:locationId')
  @UseGuards(PermissionsGuard)
  @RequirePermission('districts:read')
  async findByLocation(@Param('locationId') locationId: string) {
    return this.districtService.findByLocation(locationId);
  }
}
