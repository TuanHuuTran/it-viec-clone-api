import { SetMetadata } from '@nestjs/common';

export type PermissionType =
  | 'jobs:create' | 'jobs:read' | 'jobs:update' | 'jobs:delete'
  | 'applications:read' | 'applications:process' | 'applications:create'
  | 'users:read'
  | 'content:moderate' | 'users:create' | 'users:update' | 'roles:read' | 'permissions:read' | 'employers:create' | 'employers:read'
  | 'locations:read' | 'districts:read' | 'industries:read' | 'skills:read'
  ;

export const RequirePermission = (...permissions: PermissionType[]) =>
  SetMetadata('permissions', permissions);
