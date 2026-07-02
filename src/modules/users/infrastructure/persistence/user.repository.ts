import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity, UserRole } from '../../domain/entities/user.entity';
import { UserRepository } from '../../domain/repositories/user.repository.interface';
import { UserOrmEntity } from './entities/user.orm-entity';

@Injectable()
export class UserRepositoryImpl extends UserRepository {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly repo: Repository<UserOrmEntity>,
  ) {
    super();
  }

  async findById(id: string): Promise<UserEntity | null> {
    const orm = await this.repo.findOneBy({ id });
    return orm ? this.fromOrm(orm) : null;
  }

  async findAll(): Promise<UserEntity[]> {
    return (await this.repo.find()).map((o) => this.fromOrm(o));
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const orm = await this.repo.findOneBy({ email });
    return orm ? this.fromOrm(orm) : null;
  }

  async findByPhone(phone: string): Promise<UserEntity | null> {
    const orm = await this.repo.findOneBy({ phone });
    return orm ? this.fromOrm(orm) : null;
  }

  async findDrivers(): Promise<UserEntity[]> {
    return (await this.repo.findBy({ role: UserRole.DRIVER })).map((o) => this.fromOrm(o));
  }

  async save(entity: UserEntity): Promise<UserEntity> {
    return this.fromOrm(await this.repo.save(this.toOrm(entity)));
  }

  async update(entity: UserEntity): Promise<UserEntity> {
    return this.fromOrm(await this.repo.save(this.toOrm(entity)));
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  async exists(id: string): Promise<boolean> {
    return this.repo.existsBy({ id });
  }

  private toOrm(entity: UserEntity): UserOrmEntity {
    const orm = new UserOrmEntity();
    orm.id = entity.id;
    orm.firstName = entity.firstName;
    orm.lastName = entity.lastName;
    orm.email = entity.email;
    orm.phone = entity.phone;
    orm.passwordHash = entity.passwordHash;
    orm.role = entity.role;
    orm.status = entity.status;
    orm.profilePhotoUrl = entity.profilePhotoUrl ?? null;
    orm.averageRating = entity.averageRating;
    orm.createdAt = entity.createdAt;
    orm.updatedAt = entity.updatedAt;
    return orm;
  }

  private fromOrm(orm: UserOrmEntity): UserEntity {
    const entity = UserEntity.create({
      id: orm.id,
      firstName: orm.firstName,
      lastName: orm.lastName,
      email: orm.email,
      phone: orm.phone,
      passwordHash: orm.passwordHash,
      role: orm.role,
      status: orm.status,
      profilePhotoUrl: orm.profilePhotoUrl ?? undefined,
      averageRating: orm.averageRating,
    });
    Object.assign(entity, { createdAt: orm.createdAt, updatedAt: orm.updatedAt });
    return entity;
  }
}
