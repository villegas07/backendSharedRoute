import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { RefreshTokenRepository } from './domain/repositories/refresh-token.repository.interface';
import { PasswordResetTokenRepository } from './domain/repositories/password-reset-token.repository.interface';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { RegisterUseCase } from './application/use-cases/register.use-case';
import { LogoutUseCase } from './application/use-cases/logout.use-case';
import { ForgotPasswordUseCase } from './application/use-cases/forgot-password.use-case';
import { ResetPasswordUseCase } from './application/use-cases/reset-password.use-case';
import { GoogleAuthUseCase } from './application/use-cases/google-auth.use-case';
import { RefreshTokenRepositoryImpl } from './infrastructure/persistence/refresh-token.repository';
import { PasswordResetTokenRepositoryImpl } from './infrastructure/persistence/password-reset-token.repository';
import { RefreshTokenOrmEntity } from './infrastructure/persistence/entities/refresh-token.orm-entity';
import { PasswordResetTokenOrmEntity } from './infrastructure/persistence/entities/password-reset-token.orm-entity';
import { TokenService } from './infrastructure/strategies/token.service';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';
import { GoogleStrategy } from './infrastructure/strategies/google.strategy';
import { NodemailerEmailService } from './infrastructure/email/nodemailer-email.service';
import { EmailPort } from './application/ports/email.port';
import { AuthController } from './presentation/controllers/auth.controller';

const googleStrategyProviders = process.env.GOOGLE_CLIENT_ID ? [GoogleStrategy] : [];

@Module({
  imports: [
    UsersModule,
    JwtModule.register({}),
    TypeOrmModule.forFeature([RefreshTokenOrmEntity, PasswordResetTokenOrmEntity]),
  ],
  controllers: [AuthController],
  providers: [
    { provide: RefreshTokenRepository, useClass: RefreshTokenRepositoryImpl },
    { provide: PasswordResetTokenRepository, useClass: PasswordResetTokenRepositoryImpl },
    { provide: EmailPort, useClass: NodemailerEmailService },
    TokenService,
    JwtStrategy,
    ...googleStrategyProviders,
    LoginUseCase,
    RegisterUseCase,
    LogoutUseCase,
    ForgotPasswordUseCase,
    ResetPasswordUseCase,
    GoogleAuthUseCase,
  ],
  exports: [TokenService],
})
export class AuthModule {}
