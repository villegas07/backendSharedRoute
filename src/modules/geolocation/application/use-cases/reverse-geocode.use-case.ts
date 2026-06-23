import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../../application/use-cases/use-case.interface';
import { GeocodingPort } from '../../domain/ports/geocoding.port';
import { GeocodedAddress } from '../../domain/value-objects/geocoded-address.vo';
import { CoordinatesValueObject } from '../../domain/value-objects/coordinates.vo';

interface ReverseGeocodeInput {
  latitude: number;
  longitude: number;
}

@Injectable()
export class ReverseGeocodeUseCase
  implements UseCase<ReverseGeocodeInput, GeocodedAddress>
{
  constructor(private readonly geocodingPort: GeocodingPort) {}

  async execute(input: ReverseGeocodeInput): Promise<GeocodedAddress> {
    CoordinatesValueObject.create(input);
    return this.geocodingPort.reverseGeocode(
      input.latitude,
      input.longitude,
    );
  }
}
