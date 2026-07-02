import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DocumentStatus, DocumentType, DriverDocumentEntity } from '../../domain/entities/driver-document.entity';
import { DriverDocumentRepository } from '../../domain/repositories/driver-document.repository.interface';
import { DriverDocumentOrmEntity } from './entities/driver-document.orm-entity';

@Injectable()
export class DriverDocumentRepositoryImpl extends DriverDocumentRepository {
  constructor(
    @InjectRepository(DriverDocumentOrmEntity)
    private readonly repo: Repository<DriverDocumentOrmEntity>,
  ) {
    super();
  }

  async findById(id: string): Promise<DriverDocumentEntity | null> {
    const orm = await this.repo.findOneBy({ id });
    return orm ? this.fromOrm(orm) : null;
  }

  async findAll(): Promise<DriverDocumentEntity[]> {
    return (await this.repo.find()).map((o) => this.fromOrm(o));
  }

  async findByDriverId(driverId: string): Promise<DriverDocumentEntity[]> {
    return (await this.repo.findBy({ driverId })).map((o) => this.fromOrm(o));
  }

  async findByDriverAndType(driverId: string, type: DocumentType): Promise<DriverDocumentEntity | null> {
    const orm = await this.repo.findOneBy({ driverId, type });
    return orm ? this.fromOrm(orm) : null;
  }

  async findPending(): Promise<DriverDocumentEntity[]> {
    return (await this.repo.findBy({ status: DocumentStatus.PENDING })).map((o) => this.fromOrm(o));
  }

  async hasAllApproved(driverId: string): Promise<boolean> {
    const required = [DocumentType.SOAT, DocumentType.LICENSE, DocumentType.CEDULA];
    const docs = await this.repo.findBy({ driverId, status: DocumentStatus.APPROVED });
    return required.every((t) => docs.some((d) => d.type === t));
  }

  async save(entity: DriverDocumentEntity): Promise<DriverDocumentEntity> {
    return this.fromOrm(await this.repo.save(this.toOrm(entity)));
  }

  async update(entity: DriverDocumentEntity): Promise<DriverDocumentEntity> {
    return this.fromOrm(await this.repo.save(this.toOrm(entity)));
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  async exists(id: string): Promise<boolean> {
    return this.repo.existsBy({ id });
  }

  private toOrm(entity: DriverDocumentEntity): DriverDocumentOrmEntity {
    const orm = new DriverDocumentOrmEntity();
    orm.id = entity.id;
    orm.driverId = entity.driverId;
    orm.vehicleId = entity.vehicleId ?? null;
    orm.type = entity.type;
    orm.fileUrl = entity.fileUrl;
    orm.fileOriginalName = entity.fileOriginalName;
    orm.identificationNumber = entity.identificationNumber ?? null;
    orm.expiresAt = entity.expiresAt ?? null;
    orm.status = entity.status;
    orm.reviewNote = entity.reviewNote ?? null;
    orm.reviewedBy = entity.reviewedBy ?? null;
    orm.createdAt = entity.createdAt;
    orm.updatedAt = entity.updatedAt;
    return orm;
  }

  private fromOrm(orm: DriverDocumentOrmEntity): DriverDocumentEntity {
    const entity = DriverDocumentEntity.create({
      id: orm.id,
      driverId: orm.driverId,
      vehicleId: orm.vehicleId ?? undefined,
      type: orm.type,
      fileUrl: orm.fileUrl,
      fileOriginalName: orm.fileOriginalName,
      identificationNumber: orm.identificationNumber ?? undefined,
      expiresAt: orm.expiresAt ?? undefined,
      status: orm.status,
      reviewNote: orm.reviewNote ?? undefined,
      reviewedBy: orm.reviewedBy ?? undefined,
    });
    Object.assign(entity, { createdAt: orm.createdAt, updatedAt: orm.updatedAt });
    return entity;
  }
}
