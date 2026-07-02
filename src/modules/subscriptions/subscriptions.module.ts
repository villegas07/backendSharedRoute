import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentsModule } from '../documents/documents.module';
import { SubscriptionRepository } from './domain/repositories/subscription.repository.interface';
import { SubscriptionPlanRepository } from './domain/repositories/subscription-plan.repository.interface';
import { GetPlansUseCase } from './application/use-cases/get-plans.use-case';
import { PurchaseSubscriptionUseCase } from './application/use-cases/purchase-subscription.use-case';
import { GetMySubscriptionUseCase } from './application/use-cases/get-my-subscription.use-case';
import { SubscriptionRepositoryImpl } from './infrastructure/persistence/subscription.repository';
import { SubscriptionPlanRepositoryImpl } from './infrastructure/persistence/subscription-plan.repository';
import { SubscriptionOrmEntity } from './infrastructure/persistence/entities/subscription.orm-entity';
import { SubscriptionPlanOrmEntity } from './infrastructure/persistence/entities/subscription-plan.orm-entity';
import { SubscriptionsController } from './presentation/controllers/subscriptions.controller';

@Module({
  imports: [
    DocumentsModule,
    TypeOrmModule.forFeature([SubscriptionOrmEntity, SubscriptionPlanOrmEntity]),
  ],
  controllers: [SubscriptionsController],
  providers: [
    { provide: SubscriptionRepository, useClass: SubscriptionRepositoryImpl },
    { provide: SubscriptionPlanRepository, useClass: SubscriptionPlanRepositoryImpl },
    GetPlansUseCase,
    PurchaseSubscriptionUseCase,
    GetMySubscriptionUseCase,
  ],
  exports: [SubscriptionRepository, SubscriptionPlanRepository],
})
export class SubscriptionsModule {}
