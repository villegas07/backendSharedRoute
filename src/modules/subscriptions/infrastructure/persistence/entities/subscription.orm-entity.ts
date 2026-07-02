import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { SubscriptionStatus } from '../../../domain/entities/subscription.entity';

@Entity('subscriptions')
export class SubscriptionOrmEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  driverId: string;

  @Column()
  planId: string;

  @Column()
  planName: string;

  @Column()
  startAt: Date;

  @Column()
  expiresAt: Date;

  @Column({ type: 'enum', enum: SubscriptionStatus, default: SubscriptionStatus.ACTIVE })
  status: SubscriptionStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
