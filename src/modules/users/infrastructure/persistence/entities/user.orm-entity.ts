import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { UserRole, UserStatus } from '../../../domain/entities/user.entity';

@Entity('users')
export class UserOrmEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column()
  phone: string;

  @Column()
  passwordHash: string;

  @Column({ type: 'enum', enum: UserRole })
  role: UserRole;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.PENDING_VERIFICATION })
  status: UserStatus;

  @Column({ nullable: true, type: 'varchar' })
  profilePhotoUrl: string | null;

  @Column({ type: 'float', default: 0 })
  averageRating: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
