import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { VehicleStatus } from '../../../domain/entities/vehicle.entity';

@Entity('vehicles')
export class VehicleOrmEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  ownerId: string;

  @Column()
  brand: string;

  @Column()
  model: string;

  @Column()
  year: number;

  @Column({ unique: true })
  plate: string;

  @Column()
  color: string;

  @Column()
  totalSeats: number;

  @Column({ type: 'enum', enum: VehicleStatus, default: VehicleStatus.PENDING_INSPECTION })
  status: VehicleStatus;

  @Column({ nullable: true, type: 'varchar' })
  photoUrl: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
