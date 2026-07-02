import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile, StrategyOptions } from 'passport-google-oauth20';
import { GoogleAuthUseCase } from '../../application/use-cases/google-auth.use-case';
import { AuthResponseDto } from '../../application/dtos/auth-response.dto';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    configService: ConfigService,
    private readonly googleAuthUseCase: GoogleAuthUseCase,
  ) {
    const options: StrategyOptions = {
      clientID: configService.get<string>('googleOauth.clientId') ?? '',
      clientSecret: configService.get<string>('googleOauth.clientSecret') ?? '',
      callbackURL: configService.get<string>('googleOauth.callbackUrl') ?? '',
      scope: ['email', 'profile'],
    };
    super(options);
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
  ): Promise<AuthResponseDto> {
    return this.googleAuthUseCase.execute({
      email: profile.emails![0].value,
      firstName: profile.name?.givenName ?? '',
      lastName: profile.name?.familyName ?? '',
      profilePhotoUrl: profile.photos?.[0]?.value,
    });
  }
}
