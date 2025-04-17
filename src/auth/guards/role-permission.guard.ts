import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleType } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { PermissionType } from '../decorator/auth.require-permission.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  private readonly logger = new Logger(PermissionsGuard.name);

  constructor(
    private reflector: Reflector,
    private prismaService: PrismaService,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.get<PermissionType[]>(
      'permissions',
      context.getHandler(),
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user || !user.sub) {
      this.logger.warn(`Access denied: No valid user found in request`);
      throw new ForbiddenException('Access denied');
    }

    if (user.roles.includes(RoleType.ADMIN)) {
      this.logger.log(`User ${user.sub} has ADMIN role - granting full access`);
      return true;
    }

    const userRolePermissions = await this.prismaService.rolePermission.findMany({
      where: {
        role: {
          users: {
            some: {
              userId: user.sub
            }
          }
        }
      },
      include: {
        permission: {
          select: {
            code: true
          }
        }
      }
    });

    const userPermissionCodes = new Set(
      userRolePermissions.map(rp => rp.permission.code)
    );

    const hasAllPermissions = requiredPermissions.every(permission => userPermissionCodes.has(permission));

    if (!hasAllPermissions) {
      const missingPermissions = requiredPermissions.filter(
        permission => !userPermissionCodes.has(permission)
      );
      this.logger.warn(
        `User ${user.sub} lacks required permissions: ${missingPermissions.join(', ')}`
      );
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
