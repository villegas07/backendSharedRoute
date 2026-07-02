import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from './domain/repositories/user.repository.interface';
import { CreateUserUseCase } from './application/use-cases/create-user.use-case';
import { FindUserByIdUseCase } from './application/use-cases/find-user-by-id.use-case';
import { GetAllUsersUseCase } from './application/use-cases/get-all-users.use-case';
import { UpdateUserUseCase } from './application/use-cases/update-user.use-case';
import { DeleteUserUseCase } from './application/use-cases/delete-user.use-case';
import { UserRepositoryImpl } from './infrastructure/persistence/user.repository';
import { UserOrmEntity } from './infrastructure/persistence/entities/user.orm-entity';
import { UsersController } from './presentation/controllers/users.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UserOrmEntity])],
  controllers: [UsersController],
  providers: [
    { provide: UserRepository, useClass: UserRepositoryImpl },
    CreateUserUseCase,
    FindUserByIdUseCase,
    GetAllUsersUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase,
  ],
  exports: [UserRepository, CreateUserUseCase, FindUserByIdUseCase],
})
export class UsersModule {}
