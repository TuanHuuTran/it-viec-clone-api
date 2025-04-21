import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateLocationDto, UpdateLocationDto } from './dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class LocationService {
  constructor(private prismaService: PrismaService) { }

  async create(data: CreateLocationDto) {
    return await this.prismaService.location.create({ data })
  }

  async findAll() {
    return await this.prismaService.location.findMany();
  }

  async findOne(id: string) {
    const location = await this.prismaService.location.findUnique({
      where: { id }
    });

    if (!location) {
      throw new NotFoundException(`Location with ID ${id} not found`);
    }

    return location;
  }

  async update(id: string, data: UpdateLocationDto) {
    await this.findOne(id);

    return await this.prismaService.location.update({
      where: { id },
      data
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.prismaService.location.delete({
      where: { id }
    });

    return { message: `Location with ID ${id} was deleted` };
  }
}
