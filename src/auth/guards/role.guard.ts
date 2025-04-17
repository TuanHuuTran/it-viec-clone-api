import { CanActivate, ExecutionContext, ForbiddenException, Injectable, Logger } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { RoleType } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";


@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(
    private reflector: Reflector,
    private prismaService: PrismaService,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.get<RoleType[]>(
      'roles',
      context.getHandler(),
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.sub) {
      this.logger.warn(`Access denied: No valid user found in request`);
      throw new ForbiddenException('Access denied');
    }

    const userRole = user?.roles

    const hasRequiredRole = requiredRoles.some(role => userRole.includes(role));
    if (!hasRequiredRole) {
      this.logger.warn(
        `User ${user.sub} lacks required roles: ${requiredRoles.join(', ')}`
      );
      throw new ForbiddenException('Insufficient role');
    }

    return true;
  }
}
