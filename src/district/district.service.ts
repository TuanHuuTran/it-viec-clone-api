import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDistrictDto, UpdateDistrictDto } from './dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DistrictService {
  constructor(private prismaService: PrismaService) { }

  async create(data: CreateDistrictDto) {
    const location = await this.prismaService.location.findUnique({
      where: { id: data.locationId }
    });

    if (!location) {
      throw new NotFoundException(`Location with ID ${data.locationId} not found`);
    }

    return await this.prismaService.district.create({ data });
  }

  async createMany(data: CreateDistrictDto[]): Promise<{ count: number }> {
    const locationIds = [...new Set(data.map(dto => dto.locationId))];

    const locations = await this.prismaService.location.findMany({
      where: {
        id: {
          in: locationIds
        }
      },
      select: { id: true }
    });

    const foundLocationIds = locations.map(location => location.id);

    const missingLocationIds = locationIds.filter(id => !foundLocationIds.includes(id));

    if (missingLocationIds.length > 0) {
      throw new NotFoundException(`Locations with IDs ${missingLocationIds.join(', ')} not found`);
    }


    const result = await this.prismaService.district.createMany({
      data,
      skipDuplicates: true
    });

    return { count: result.count };
  }


  async findAll() {
    return await this.prismaService.district.findMany({
      include: {
        location: true
      }
    });
  }

  async findOne(id: string) {
    const district = await this.prismaService.district.findUnique({
      where: { id },
      include: {
        location: true
      }
    });

    if (!district) {
      throw new NotFoundException(`District with ID ${id} not found`);
    }

    return district;
  }

  async update(id: string, data: UpdateDistrictDto) {
    await this.findOne(id);

    if (data.locationId) {
      const location = await this.prismaService.location.findUnique({
        where: { id: data.locationId }
      });

      if (!location) {
        throw new NotFoundException(`Location with ID ${data.locationId} not found`);
      }
    }

    return await this.prismaService.district.update({
      where: { id },
      data,
      include: {
        location: true
      }
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.prismaService.district.delete({
      where: { id }
    });

    return { message: `District with ID ${id} was deleted` };
  }

  async findByLocation(locationId: string) {
    const location = await this.prismaService.location.findUnique({
      where: { id: locationId }
    });

    if (!location) {
      throw new NotFoundException(`Location with ID ${locationId} not found`);
    }

    return await this.prismaService.district.findMany({
      where: { locationId }
    });
  }
}
