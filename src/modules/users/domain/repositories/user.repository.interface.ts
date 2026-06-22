import { BaseRepository } from '../../../../domain/repositories/base.repository.interface';
import { UserEntity } from '../entities/user.entity';

export abstract class UserRepository extends BaseRepository<UserEntity> {
  abstract findByEmail(email: string): Promise<UserEntity | null>;
  abstract findByPhone(phone: string): Promise<UserEntity | null>;
  abstract findDrivers(): Promise<UserEntity[]>;
}
