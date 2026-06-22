import { Injectable } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserRole } from '../../../users/domain/entities/user.entity';

export interface JwtPayload {
  sub: string;
  role: UserRole;
}

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  generateAccessToken(userId: string, role: UserRole): Promise<string> {
    const payload: JwtPayload = { sub: userId, role };
    const options = this.buildOptions('jwt.secret', 'jwt.expiresIn');
    return this.jwtService.signAsync(payload, options);
  }

  generateRefreshToken(userId: string): Promise<string> {
    const options = this.buildOptions('jwt.refreshSecret', 'jwt.refreshExpiresIn');
    return this.jwtService.signAsync({ sub: userId }, options);
  }

  verifyAccessToken(token: string): Promise<JwtPayload> {
    return this.jwtService.verifyAsync<JwtPayload>(token, {
      secret: this.configService.get<string>('jwt.secret'),
    });
  }

  private buildOptions(secretKey: string, expiresInKey: string): JwtSignOptions {
    return {
      secret: this.configService.get<string>(secretKey),
      expiresIn: this.configService.get<number>(expiresInKey) ?? '1h',
    };
  }
}

