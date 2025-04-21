import { Module } from '@nestjs/common';
import { EmployerRegistrationController } from './employer-registration.controller';
import { EmployerRegistrationService } from './employer-registration.service';
import { UsersModule } from 'src/users/users.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [UsersModule, AuthModule],
  controllers: [EmployerRegistrationController],
  providers: [EmployerRegistrationService]
})
export class EmployerRegistrationModule { }
