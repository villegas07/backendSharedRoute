import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { BookingStatus } from '../../../domain/entities/booking.entity';

@Entity('bookings')
export class BookingOrmEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  tripId: string;

  @Column()
  passengerId: string;

  @Column()
  seatsReserved: number;

  @Column({ type: 'float' })
  totalPrice: number;

  @Column({ type: 'enum', enum: BookingStatus, default: BookingStatus.PENDING })
  status: BookingStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
