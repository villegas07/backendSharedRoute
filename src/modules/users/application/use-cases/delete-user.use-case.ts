import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../../domain/repositories/user.repository.interface';

@Injectable()
export class DeleteUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(userId: string): Promise<void> {
    const exists = await this.userRepository.exists(userId);
    if (!exists) throw new NotFoundException('User not found');
    await this.userRepository.delete(userId);
  }
}
