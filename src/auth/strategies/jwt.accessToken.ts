import { ForbiddenException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { PrismaService } from "src/prisma/prisma.service";


@Injectable()
export class accessTokenStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prismaService: PrismaService

  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_ACCESS_SECRET')!,
    })
  }
  async validate(payload: any) {
    const user = await this.prismaService.user.findUnique({
      where: { id: payload.sub }
    })

    if (user?.tokenVersion !== payload.tokenVersion) {
      throw new ForbiddenException('Invalid token')
    }
    return payload
  }
}
