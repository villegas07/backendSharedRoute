import { Injectable } from '@nestjs/common';
import { PasswordResetTokenEntity } from '../../domain/entities/password-reset-token.entity';
import { PasswordResetTokenRepository } from '../../domain/repositories/password-reset-token.repository.interface';

@Injectable()
export class PasswordResetTokenRepositoryImpl extends PasswordResetTokenRepository {
  async findById(_id: string): Promise<PasswordResetTokenEntity | null> {
    throw new Error('PasswordResetTokenRepositoryImpl.findById — Not implemented.');
  }

  async findAll(): Promise<PasswordResetTokenEntity[]> {
    throw new Error('PasswordResetTokenRepositoryImpl.findAll — Not implemented.');
  }

  async findByToken(_token: string): Promise<PasswordResetTokenEntity | null> {
    throw new Error('PasswordResetTokenRepositoryImpl.findByToken — Not implemented.');
  }

  async deleteByUserId(_userId: string): Promise<void> {
    throw new Error('PasswordResetTokenRepositoryImpl.deleteByUserId — Not implemented.');
  }

  async save(_entity: PasswordResetTokenEntity): Promise<PasswordResetTokenEntity> {
    throw new Error('PasswordResetTokenRepositoryImpl.save — Not implemented.');
  }

  async update(_entity: PasswordResetTokenEntity): Promise<PasswordResetTokenEntity> {
    throw new Error('PasswordResetTokenRepositoryImpl.update — Not implemented.');
  }

  async delete(_id: string): Promise<void> {
    throw new Error('PasswordResetTokenRepositoryImpl.delete — Not implemented.');
  }

  async exists(_id: string): Promise<boolean> {
    throw new Error('PasswordResetTokenRepositoryImpl.exists — Not implemented.');
  }
}
