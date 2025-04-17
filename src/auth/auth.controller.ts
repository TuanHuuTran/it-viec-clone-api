import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { loginDTO, registerDTO } from './dto';

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

}
