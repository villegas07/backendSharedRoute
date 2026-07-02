import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefreshTokenEntity } from '../../domain/entities/refresh-token.entity';
import { RefreshTokenRepository } from '../../domain/repositories/refresh-token.repository.interface';
import { RefreshTokenOrmEntity } from './entities/refresh-token.orm-entity';

@Injectable()
export class RefreshTokenRepositoryImpl extends RefreshTokenRepository {
  constructor(
    @InjectRepository(RefreshTokenOrmEntity)
    private readonly repo: Repository<RefreshTokenOrmEntity>,
  ) {
    super();
  }

  async findById(id: string): Promise<RefreshTokenEntity | null> {
    const orm = await this.repo.findOneBy({ id });
    return orm ? this.fromOrm(orm) : null;
  }

  async findAll(): Promise<RefreshTokenEntity[]> {
    return (await this.repo.find()).map((o) => this.fromOrm(o));
  }

  async findByToken(token: string): Promise<RefreshTokenEntity | null> {
    const orm = await this.repo.findOneBy({ token });
    return orm ? this.fromOrm(orm) : null;
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await this.repo.update({ userId }, { isRevoked: true });
  }

  async save(entity: RefreshTokenEntity): Promise<RefreshTokenEntity> {
    return this.fromOrm(await this.repo.save(this.toOrm(entity)));
  }

  async update(entity: RefreshTokenEntity): Promise<RefreshTokenEntity> {
    return this.fromOrm(await this.repo.save(this.toOrm(entity)));
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  async exists(id: string): Promise<boolean> {
    return this.repo.existsBy({ id });
  }

  private toOrm(entity: RefreshTokenEntity): RefreshTokenOrmEntity {
    const orm = new RefreshTokenOrmEntity();
    orm.id = entity.id;
    orm.userId = entity.userId;
    orm.token = entity.token;
    orm.expiresAt = entity.expiresAt;
    orm.isRevoked = entity.isRevoked;
    orm.createdAt = entity.createdAt;
    orm.updatedAt = entity.updatedAt;
    return orm;
  }

  private fromOrm(orm: RefreshTokenOrmEntity): RefreshTokenEntity {
    const entity = RefreshTokenEntity.create({
      id: orm.id,
      userId: orm.userId,
      token: orm.token,
      expiresAt: orm.expiresAt,
      isRevoked: orm.isRevoked,
    });
    Object.assign(entity, { createdAt: orm.createdAt, updatedAt: orm.updatedAt });
    return entity;
  }
}
