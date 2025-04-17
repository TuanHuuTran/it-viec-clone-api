import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { loginDTO, registerDTO } from './dto';
import { GetUser } from './decorator/auth.decorator';
import { User } from '@prisma/client';
import { JwtRefreshGuard } from './guards/jwt-refreshToken.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }
  @Post("register")
  async register(@Body() registerDTO: registerDTO) {
    return await this.authService.register(registerDTO)
  }

  @Post("login")
  async login(@Body() loginDTO: loginDTO) {
    return await this.authService.login(loginDTO)
  }


  @UseGuards(JwtRefreshGuard)
  @Post("refresh")

  async refreshToken(@GetUser() payload: any) {
    return await this.authService.refreshToken(payload)
  }

}
