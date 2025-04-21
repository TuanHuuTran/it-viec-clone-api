import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Skill } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSkillDto, UpdateSkillDto } from './dto';

@Injectable()
export class SkillService {
  constructor(private prismaService: PrismaService) { }

  async create(data: CreateSkillDto) {
    try {
      return await this.prismaService.skill.create({ data });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException(`Skill with name "${data.name}" already exists`);
      }
      throw error;
    }
  }

  async findAll() {
    return await this.prismaService.skill.findMany();
  }

  async findOne(id: string) {
    const skill = await this.prismaService.skill.findUnique({
      where: { id }
    });

    if (!skill) {
      throw new NotFoundException(`Skill with ID ${id} not found`);
    }

    return skill;
  }

  async update(id: string, data: UpdateSkillDto) {
    try {
      await this.findOne(id);

      return await this.prismaService.skill.update({
        where: { id },
        data
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException(`Skill with name "${data.name}" already exists`);
      }
      throw error;
    }
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.prismaService.skill.delete({
      where: { id }
    });

    return { message: `Skill with ID ${id} was deleted` };
  }

  async createMany(data: CreateSkillDto[]) {
    try {
      const result = await this.prismaService.skill.createMany({
        data,
        skipDuplicates: true
      });

      return { count: result.count };
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('One or more skills with the provided names already exist');
      }
      throw error;
    }
  }
}
