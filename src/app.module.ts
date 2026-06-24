import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { appConfig } from './config/app.config';
import { databaseConfig } from './config/database.config';
import { jwtConfig } from './config/jwt.config';
import { redisConfig } from './config/redis.config';
import { googleMapsConfig } from './config/google-maps.config';
import { wompiConfig } from './config/wompi.config';
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
      load: [appConfig, databaseConfig, jwtConfig, redisConfig, googleMapsConfig, wompiConfig, smtpConfig],
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



