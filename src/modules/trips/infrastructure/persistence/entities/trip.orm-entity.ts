import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { TripStatus } from '../../../domain/entities/trip.entity';
import { LocationEmbedded } from './location.embedded';

@Entity('trips')
export class TripOrmEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  driverId: string;

  @Column()
  vehicleId: string;

  @Column(() => LocationEmbedded)
  origin: LocationEmbedded;

  @Column(() => LocationEmbedded)
  destination: LocationEmbedded;

  @Column()
  departureAt: Date;

  @Column()
  availableSeats: number;

  @Column({ type: 'float' })
  pricePerSeat: number;

  @Column({ type: 'enum', enum: TripStatus, default: TripStatus.DRAFT })
  status: TripStatus;

  @Column({ nullable: true, type: 'varchar' })
  notes: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
