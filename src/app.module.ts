import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { RoleModule } from './role/role.module';
import { PermissionModule } from './permission/permission.module';
import { UserRoleModule } from './user-role/user-role.module';
import { RolePermissionModule } from './role-permission/role-permission.module';
import { EmployerProfileModule } from './employer-profile/employer-profile.module';
import { EmployerRegistrationModule } from './employer-registration/employer-registration.module';
import { JobModule } from './job/job.module';
import { LocationModule } from './location/location.module';
import { DistrictModule } from './district/district.module';
import { IndustryModule } from './industry/industry.module';
import { SkillModule } from './skill/skill.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule, AuthModule, UsersModule, RoleModule, PermissionModule, UserRoleModule, RolePermissionModule, EmployerProfileModule, EmployerRegistrationModule, JobModule, LocationModule, DistrictModule, IndustryModule, SkillModule],
})
export class AppModule { }
