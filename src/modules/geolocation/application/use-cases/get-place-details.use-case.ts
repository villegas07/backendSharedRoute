import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../../application/use-cases/use-case.interface';
import { GeocodingPort } from '../../domain/ports/geocoding.port';
import { GeocodedAddress } from '../../domain/value-objects/geocoded-address.vo';

@Injectable()
export class GetPlaceDetailsUseCase
  implements UseCase<string, GeocodedAddress>
{
  constructor(private readonly geocodingPort: GeocodingPort) {}

  async execute(placeId: string): Promise<GeocodedAddress> {
    return this.geocodingPort.getPlaceDetails(placeId);
  }
}
