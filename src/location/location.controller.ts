import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { RoleType } from '@prisma/client';
import { RequireRoles } from 'src/auth/decorator/auth.require-role.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/role.guard';
import { LocationService } from './location.service';
import { CreateLocationDto, UpdateLocationDto } from './dto';
import { RequirePermission } from 'src/auth/decorator/auth.require-permission.decorator';
import { PermissionsGuard } from 'src/auth/guards/role-permission.guard';

@Controller('locations')
@UseGuards(JwtAuthGuard)
export class LocationController {

  constructor(private locationService: LocationService) { }

  @Post()
  @UseGuards(RolesGuard)
  @RequireRoles(RoleType.ADMIN)

  async create(@Body() createDto: CreateLocationDto) {
    return this.locationService.create(createDto)
  }

  @Get()
  @UseGuards(PermissionsGuard)
  @RequirePermission('locations:read')
  async findAll() {
    return this.locationService.findAll();
  }

  @Get(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermission('locations:read')
  async findOne(@Param('id') id: string) {
    return this.locationService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @RequireRoles(RoleType.ADMIN)
  async update(@Param('id') id: string, @Body() updateDto: UpdateLocationDto) {
    return this.locationService.update(id, updateDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @RequireRoles(RoleType.ADMIN)
  async remove(@Param('id') id: string) {
    return this.locationService.remove(id);
  }
}
