import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { RoleType } from '@prisma/client';
import { RequirePermission } from 'src/auth/decorator/auth.require-permission.decorator';
import { RequireRoles } from 'src/auth/decorator/auth.require-role.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/auth/guards/role-permission.guard';
import { RolesGuard } from 'src/auth/guards/role.guard';
import { SkillService } from './skill.service';
import { CreateSkillDto, UpdateSkillDto } from './dto';

@Controller('skills')
@UseGuards(JwtAuthGuard)
export class SkillController {
  constructor(private skillService: SkillService) { }

  @Post()
  @UseGuards(RolesGuard)
  @RequireRoles(RoleType.ADMIN)
  async create(@Body() createDto: CreateSkillDto) {
    return this.skillService.create(createDto);
  }

  @Get()
  @UseGuards(PermissionsGuard)
  @RequirePermission('skills:read')
  async findAll() {
    return this.skillService.findAll();
  }

  @Get(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermission('skills:read')
  async findOne(@Param('id') id: string) {
    return this.skillService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @RequireRoles(RoleType.ADMIN)
  async update(@Param('id') id: string, @Body() updateDto: UpdateSkillDto) {
    return this.skillService.update(id, updateDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @RequireRoles(RoleType.ADMIN)
  async remove(@Param('id') id: string) {
    return this.skillService.remove(id);
  }

  @Post('batch')
  @UseGuards(RolesGuard)
  @RequireRoles(RoleType.ADMIN)
  async createMany(@Body() createDtos: CreateSkillDto[]) {
    return this.skillService.createMany(createDtos);
  }
}
