import { Injectable } from '@nestjs/common';
import { RefreshTokenEntity } from '../../domain/entities/refresh-token.entity';
import { RefreshTokenRepository } from '../../domain/repositories/refresh-token.repository.interface';

@Injectable()
export class RefreshTokenRepositoryImpl extends RefreshTokenRepository {
  async findById(_id: string): Promise<RefreshTokenEntity | null> {
    throw new Error('RefreshTokenRepositoryImpl.findById — Not implemented.');
  }

  async findAll(): Promise<RefreshTokenEntity[]> {
    throw new Error('RefreshTokenRepositoryImpl.findAll — Not implemented.');
  }

  async findByToken(_token: string): Promise<RefreshTokenEntity | null> {
    throw new Error('RefreshTokenRepositoryImpl.findByToken — Not implemented.');
  }

  async revokeAllForUser(_userId: string): Promise<void> {
    throw new Error('RefreshTokenRepositoryImpl.revokeAllForUser — Not implemented.');
  }

  async save(_entity: RefreshTokenEntity): Promise<RefreshTokenEntity> {
    throw new Error('RefreshTokenRepositoryImpl.save — Not implemented.');
  }

  async update(_entity: RefreshTokenEntity): Promise<RefreshTokenEntity> {
    throw new Error('RefreshTokenRepositoryImpl.update — Not implemented.');
  }

  async delete(_id: string): Promise<void> {
    throw new Error('RefreshTokenRepositoryImpl.delete — Not implemented.');
  }

  async exists(_id: string): Promise<boolean> {
    throw new Error('RefreshTokenRepositoryImpl.exists — Not implemented.');
  }
}
