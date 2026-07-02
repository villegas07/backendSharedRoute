import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { PlanType } from '../../../domain/entities/subscription-plan.entity';

@Entity('subscription_plans')
export class SubscriptionPlanOrmEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: PlanType })
  type: PlanType;

  @Column()
  durationHours: number;

  @Column({ type: 'float' })
  price: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
