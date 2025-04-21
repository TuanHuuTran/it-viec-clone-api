import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Industry } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateIndustryDto, UpdateIndustryDto } from './dto';

@Injectable()
export class IndustryService {
  constructor(private prismaService: PrismaService) { }

  async create(data: CreateIndustryDto) {
    try {
      return await this.prismaService.industry.create({ data });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException(`Industry with name "${data.name}" already exists`);
      }
      throw error;
    }
  }

  async findAll() {
    return await this.prismaService.industry.findMany();
  }

  async findOne(id: string) {
    const industry = await this.prismaService.industry.findUnique({
      where: { id }
    });

    if (!industry) {
      throw new NotFoundException(`Industry with ID ${id} not found`);
    }

    return industry;
  }

  async update(id: string, data: UpdateIndustryDto) {
    try {
      await this.findOne(id);

      return await this.prismaService.industry.update({
        where: { id },
        data
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException(`Industry with name "${data.name}" already exists`);
      }
      throw error;
    }
  }

  async remove(id: string): Promise<{ message: string }> {
    await this.findOne(id);

    await this.prismaService.industry.delete({
      where: { id }
    });

    return { message: `Industry with ID ${id} was deleted` };
  }

  async createMany(data: CreateIndustryDto[]): Promise<{ count: number }> {
    try {
      const result = await this.prismaService.industry.createMany({
        data,
        skipDuplicates: true
      });

      return { count: result.count };
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('One or more industries with the provided names already exist');
      }
      throw error;
    }
  }
}
