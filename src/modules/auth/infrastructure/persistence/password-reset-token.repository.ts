import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PasswordResetTokenEntity } from '../../domain/entities/password-reset-token.entity';
import { PasswordResetTokenRepository } from '../../domain/repositories/password-reset-token.repository.interface';
import { PasswordResetTokenOrmEntity } from './entities/password-reset-token.orm-entity';

@Injectable()
export class PasswordResetTokenRepositoryImpl extends PasswordResetTokenRepository {
  constructor(
    @InjectRepository(PasswordResetTokenOrmEntity)
    private readonly repo: Repository<PasswordResetTokenOrmEntity>,
  ) {
    super();
  }

  async findById(id: string): Promise<PasswordResetTokenEntity | null> {
    const orm = await this.repo.findOneBy({ id });
    return orm ? this.fromOrm(orm) : null;
  }

  async findAll(): Promise<PasswordResetTokenEntity[]> {
    return (await this.repo.find()).map((o) => this.fromOrm(o));
  }

  async findByToken(token: string): Promise<PasswordResetTokenEntity | null> {
    const orm = await this.repo.findOneBy({ token });
    return orm ? this.fromOrm(orm) : null;
  }

  async deleteByUserId(userId: string): Promise<void> {
    await this.repo.delete({ userId });
  }

  async save(entity: PasswordResetTokenEntity): Promise<PasswordResetTokenEntity> {
    return this.fromOrm(await this.repo.save(this.toOrm(entity)));
  }

  async update(entity: PasswordResetTokenEntity): Promise<PasswordResetTokenEntity> {
    return this.fromOrm(await this.repo.save(this.toOrm(entity)));
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  async exists(id: string): Promise<boolean> {
    return this.repo.existsBy({ id });
  }

  private toOrm(entity: PasswordResetTokenEntity): PasswordResetTokenOrmEntity {
    const orm = new PasswordResetTokenOrmEntity();
    orm.id = entity.id;
    orm.userId = entity.userId;
    orm.token = entity.token;
    orm.expiresAt = entity.expiresAt;
    orm.createdAt = entity.createdAt;
    orm.updatedAt = entity.updatedAt;
    return orm;
  }

  private fromOrm(orm: PasswordResetTokenOrmEntity): PasswordResetTokenEntity {
    const entity = PasswordResetTokenEntity.restore({
      id: orm.id,
      userId: orm.userId,
      token: orm.token,
      expiresAt: orm.expiresAt,
    });
    Object.assign(entity, { createdAt: orm.createdAt, updatedAt: orm.updatedAt });
    return entity;
  }
}
