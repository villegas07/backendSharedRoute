import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../../application/use-cases/use-case.interface';
import { GeocodingPort } from '../../domain/ports/geocoding.port';
import { GeocodedAddress } from '../../domain/value-objects/geocoded-address.vo';

@Injectable()
export class GeocodeAddressUseCase
  implements UseCase<string, GeocodedAddress>
{
  constructor(private readonly geocodingPort: GeocodingPort) {}

  async execute(address: string): Promise<GeocodedAddress> {
    return this.geocodingPort.geocode(address);
  }
}
