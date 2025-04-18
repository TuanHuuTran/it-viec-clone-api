import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt'
import { loginDTO, registerDTO } from './dto';
import { JwtService } from '@nestjs/jwt';
import { RoleType } from '@prisma/client';
import { ConfigService } from '@nestjs/config';


@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService
  ) { }

  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10)
  }

  async register(registerDTO: registerDTO) {
    const hashedPassword = await this.hashPassword(registerDTO.password)
    const user = await this.prismaService.user.create({
      data: {
        email: registerDTO.email,
        password: hashedPassword,
        name: registerDTO.name,
        tokenVersion: 0
      }
    })

    const roleId = await this.checkRole(RoleType.CANDIDATE)
    await this.prismaService.userRole.create({
      data: {
        userId: user.id,
        roleId: roleId
      }
    })

    const { password, ...result } = user
    return result
  }

  async login(loginDTO: loginDTO) {
    const user = await this.prismaService.user.findUnique({
      where: { email: loginDTO.email },
      include: {
        roles: {
          include: {
            role: true
          }
        }
      }
    })

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(loginDTO.password, user?.password)
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const userRoles = await this.prismaService.userRole.findMany({
      where: { userId: user.id },
      include: { role: true },
    });

    const roles = userRoles.map(ur => ur.role.name);

    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      roles: roles,
      tokenVersion: user.tokenVersion
    }


    const accessToken = this.jwtService.sign(payload);

    const refreshTokenPayload = {
      sub: user.id,
      tokenVersion: user.tokenVersion || 0
    };

    const refreshToken = this.jwtService.sign(refreshTokenPayload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRES', '7d')
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        roles: user.roles
      },
    };

  }

  async refreshToken(payload: any) {
    const user = await this.prismaService.user.findUnique({
      where: {
        id: payload.sub
      },
    });

    if (!user || (user.tokenVersion !== undefined && user.tokenVersion !== payload.tokenVersion)) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const accessTokenPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      tokenVersion: user.tokenVersion || 0
    };

    const accessToken = this.jwtService.sign(accessTokenPayload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }
  async checkRole(name: RoleType): Promise<string> {
    if (!Object.values(RoleType).includes(name)) {
      throw new BadRequestException(`Invalid role: "${name}". Must be one of: ${Object.values(RoleType).join(', ')}`);
    }

    const existingRole = await this.prismaService.role.findUnique({
      where: { name: name },
      select: { id: true }
    });

    if (existingRole) {
      return existingRole.id;
    }

    const newRole = await this.prismaService.role.create({
      data: {
        name: name,
        description: this.getRoleDescription(name)
      },
      select: { id: true }
    });

    return newRole.id;
  }

  private getRoleDescription(role: RoleType): string {
    switch (role) {
      case RoleType.ADMIN:
        return 'System administrator with full access';
      case RoleType.EMPLOYER:
        return 'Employer who can post jobs and review applications';
      case RoleType.CANDIDATE:
        return 'Job seeker who can apply for jobs';
      case RoleType.MODERATOR:
        return 'Content moderator with limited administrative access';
      case RoleType.VISITOR:
        return 'Basic visitor with limited access';
      default:
        return 'Role with custom permissions';
    }
  }

}
