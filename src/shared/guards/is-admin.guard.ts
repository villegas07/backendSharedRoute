import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { UserRole } from '../../modules/users/domain/entities/user.entity';

@Injectable()
export class IsAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as { sub: string; role: UserRole } | undefined;

    if (user?.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Admin access required');
    }
    return true;
  }
}
