import { Module } from '@nestjs/common';
import { UserRepository } from './domain/repositories/user.repository.interface';
import { CreateUserUseCase } from './application/use-cases/create-user.use-case';
import { FindUserByIdUseCase } from './application/use-cases/find-user-by-id.use-case';
import { UserRepositoryImpl } from './infrastructure/persistence/user.repository';
import { UsersController } from './presentation/controllers/users.controller';

@Module({
  controllers: [UsersController],
  providers: [
    // DIP: bind abstract port → concrete adapter
    { provide: UserRepository, useClass: UserRepositoryImpl },
    CreateUserUseCase,
    FindUserByIdUseCase,
  ],
  exports: [UserRepository, CreateUserUseCase, FindUserByIdUseCase],
})
export class UsersModule {}
