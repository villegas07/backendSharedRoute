import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { TypeOrmModule } from '@nestjs/typeorm';
import { redisStore } from 'cache-manager-redis-yet';
import { appConfig } from './config/app.config';
import { databaseConfig } from './config/database.config';
import { jwtConfig } from './config/jwt.config';
import { redisConfig } from './config/redis.config';
import { googleMapsConfig } from './config/google-maps.config';
import { wompiConfig } from './config/wompi.config';
import { googleOauthConfig } from './config/google-oauth.config';
import { smtpConfig } from './config/smtp.config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { VehiclesModule } from './modules/vehicles/vehicles.module';
import { TripsModule } from './modules/trips/trips.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { GeolocationModule } from './modules/geolocation/geolocation.module';
import { NavigationModule } from './modules/navigation/navigation.module';
import { ChatModule } from './modules/chat/chat.module';
import { SosModule } from './modules/sos/sos.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { TripHistoryModule } from './modules/trip-history/trip-history.module';
import { PaymentModule } from './modules/payment/payment.module';
import { SupportModule } from './modules/support/support.module';
import { HealthController } from './shared/controllers/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, jwtConfig, redisConfig, googleMapsConfig, wompiConfig, smtpConfig, googleOauthConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const databaseUrl = process.env.DATABASE_URL;
        const isProduction = process.env.NODE_ENV === 'production';
        if (databaseUrl) {
          return {
            type: 'postgres' as const,
            url: databaseUrl,
            synchronize: !isProduction,
            logging: !isProduction,
            autoLoadEntities: true,
            ssl: isProduction ? { rejectUnauthorized: false } : false,
          };
        }
        return {
          type: 'postgres' as const,
          host: configService.get<string>('database.host'),
          port: configService.get<number>('database.port'),
          username: configService.get<string>('database.username'),
          password: configService.get<string>('database.password'),
          database: configService.get<string>('database.database'),
          synchronize: configService.get<boolean>('database.synchronize'),
          logging: configService.get<boolean>('database.logging'),
          autoLoadEntities: true,
        };
      },
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        store: redisStore,
        socket: {
          host: configService.get<string>('redis.host'),
          port: configService.get<number>('redis.port'),
        },
        ttl: configService.get<number>('redis.ttl'),
      }),
    }),
    AuthModule,
    UsersModule,
    VehiclesModule,
    DocumentsModule,
    SubscriptionsModule,
    TripsModule,
    BookingsModule,
    GeolocationModule,
    NavigationModule,
    ChatModule,
    SosModule,
    ReviewsModule,
    TripHistoryModule,
    PaymentModule,
    SupportModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
