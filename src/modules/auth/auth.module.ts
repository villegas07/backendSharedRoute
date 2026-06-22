import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { RefreshTokenRepository } from './domain/repositories/refresh-token.repository.interface';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { RegisterUseCase } from './application/use-cases/register.use-case';
import { RefreshTokenRepositoryImpl } from './infrastructure/persistence/refresh-token.repository';
import { TokenService } from './infrastructure/strategies/token.service';
import { AuthController } from './presentation/controllers/auth.controller';

@Module({
  imports: [
    UsersModule,
    JwtModule.register({}),
  ],
  controllers: [AuthController],
  providers: [
    { provide: RefreshTokenRepository, useClass: RefreshTokenRepositoryImpl },
    TokenService,
    LoginUseCase,
    RegisterUseCase,
  ],
  exports: [TokenService],
})
export class AuthModule {}
