import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { SubscriptionRepository } from '../../modules/subscriptions/domain/repositories/subscription.repository.interface';

@Injectable()
export class HasActiveSubscriptionGuard implements CanActivate {
  constructor(private readonly subscriptionRepository: SubscriptionRepository) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as { sub: string } | undefined;

    if (!user?.sub) return false;

    const subscription = await this.subscriptionRepository.findActiveByDriverId(user.sub);
    if (!subscription?.isActive()) {
      throw new ForbiddenException('An active subscription is required to publish trips');
    }
    return true;
  }
}
