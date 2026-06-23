import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../../application/use-cases/use-case.interface';
import { GeocodingPort } from '../../domain/ports/geocoding.port';
import { PlacePrediction } from '../../domain/value-objects/place-prediction.vo';

interface SearchPlacesInput {
  query: string;
  latitude?: number;
  longitude?: number;
}

@Injectable()
export class SearchPlacesUseCase
  implements UseCase<SearchPlacesInput, PlacePrediction[]>
{
  constructor(private readonly geocodingPort: GeocodingPort) {}

  async execute(input: SearchPlacesInput): Promise<PlacePrediction[]> {
    return this.geocodingPort.searchPlaces(
      input.query,
      input.latitude,
      input.longitude,
    );
  }
}
