import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { DocumentStatus, DocumentType } from '../../../domain/entities/driver-document.entity';

@Entity('driver_documents')
export class DriverDocumentOrmEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  driverId: string;

  @Column({ nullable: true, type: 'varchar' })
  vehicleId: string | null;

  @Column({ type: 'enum', enum: DocumentType })
  type: DocumentType;

  @Column()
  fileUrl: string;

  @Column()
  fileOriginalName: string;

  @Column({ nullable: true, type: 'varchar' })
  identificationNumber: string | null;

  @Column({ nullable: true, type: 'timestamp' })
  expiresAt: Date | null;

  @Column({ type: 'enum', enum: DocumentStatus, default: DocumentStatus.PENDING })
  status: DocumentStatus;

  @Column({ nullable: true, type: 'varchar' })
  reviewNote: string | null;

  @Column({ nullable: true, type: 'varchar' })
  reviewedBy: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
