import { Module } from '@nestjs/common';
import { EmployerProfileController } from './employer-profile.controller';
import { EmployerProfileService } from './employer-profile.service';

@Module({
  controllers: [EmployerProfileController],
  providers: [EmployerProfileService]
})
export class EmployerProfileModule {}
