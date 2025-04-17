import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt'
import { loginDTO, registerDTO } from './dto';


@Injectable()
export class AuthService {
  constructor(private prismaService: PrismaService) { }

  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10)
  }

  async register(registerDTO: registerDTO) {
    const hashedPassword = await this.hashPassword(registerDTO.password)
    const user = await this.prismaService.user.create({
      data: {
        email: registerDTO.email,
        password: hashedPassword,
        name: registerDTO.name
      }
    })
    const { password, ...result } = user
    return result
  }

  async login(loginDTO: loginDTO) {
    const user = await this.prismaService.user.findUnique({
      where: { email: loginDTO.email }
    })

    const isMatch = await bcrypt.compare(loginDTO.password, user?.password)
    return user
  }
}
