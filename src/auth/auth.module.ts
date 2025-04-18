import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { accessTokenStrategy, RefreshTokenStrategy } from './strategies';
import { RolesGuard } from './guards/role.guard';
import { PermissionsGuard } from './guards/role-permission.guard';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_ACCESS_SECRET')!,
        signOptions: { expiresIn: config.get('JWT_ACCESS_EXPIRES', '15m') },
      }),
    })],
  controllers: [AuthController],
  providers: [AuthService, accessTokenStrategy, RefreshTokenStrategy, RolesGuard, PermissionsGuard],
  exports: [AuthService]
})
export class AuthModule { }
