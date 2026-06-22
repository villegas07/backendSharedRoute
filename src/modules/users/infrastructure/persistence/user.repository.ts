import { Injectable } from '@nestjs/common';
import { UserEntity } from '../../domain/entities/user.entity';
import { UserRepository } from '../../domain/repositories/user.repository.interface';

/**
 * Stub implementation — replace with TypeORM/Prisma repository in infrastructure layer.
 * Follows the Dependency Inversion Principle: use cases depend on the abstract UserRepository,
 * not on this concrete implementation.
 */
@Injectable()
export class UserRepositoryImpl extends UserRepository {
  async findById(_id: string): Promise<UserEntity | null> {
    throw new Error('UserRepositoryImpl.findById — Not implemented. Wire a DB adapter.');
  }

  async findAll(): Promise<UserEntity[]> {
    throw new Error('UserRepositoryImpl.findAll — Not implemented.');
  }

  async findByEmail(_email: string): Promise<UserEntity | null> {
    throw new Error('UserRepositoryImpl.findByEmail — Not implemented.');
  }

  async findByPhone(_phone: string): Promise<UserEntity | null> {
    throw new Error('UserRepositoryImpl.findByPhone — Not implemented.');
  }

  async findDrivers(): Promise<UserEntity[]> {
    throw new Error('UserRepositoryImpl.findDrivers — Not implemented.');
  }

  async save(_entity: UserEntity): Promise<UserEntity> {
    throw new Error('UserRepositoryImpl.save — Not implemented.');
  }

  async update(_entity: UserEntity): Promise<UserEntity> {
    throw new Error('UserRepositoryImpl.update — Not implemented.');
  }

  async delete(_id: string): Promise<void> {
    throw new Error('UserRepositoryImpl.delete — Not implemented.');
  }

  async exists(_id: string): Promise<boolean> {
    throw new Error('UserRepositoryImpl.exists — Not implemented.');
  }
}
