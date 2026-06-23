import { Module } from '@nestjs/common';
import { GeocodingPort } from './domain/ports/geocoding.port';
import { GoogleMapsGeocodingAdapter } from './infrastructure/adapters/google-maps-geocoding.adapter';
import { ReverseGeocodeUseCase } from './application/use-cases/reverse-geocode.use-case';
import { SearchPlacesUseCase } from './application/use-cases/search-places.use-case';
import { GeocodeAddressUseCase } from './application/use-cases/geocode-address.use-case';
import { GetPlaceDetailsUseCase } from './application/use-cases/get-place-details.use-case';
import { GeolocationController } from './presentation/controllers/geolocation.controller';

@Module({
  controllers: [GeolocationController],
  providers: [
    {
      provide: GeocodingPort,
      useClass: GoogleMapsGeocodingAdapter,
    },
    ReverseGeocodeUseCase,
    SearchPlacesUseCase,
    GeocodeAddressUseCase,
    GetPlaceDetailsUseCase,
  ],
  exports: [GeocodingPort],
})
export class GeolocationModule {}
