import { GeocodedAddress } from '../value-objects/geocoded-address.vo';
import { PlacePrediction } from '../value-objects/place-prediction.vo';

export abstract class GeocodingPort {
  abstract reverseGeocode(
    latitude: number,
    longitude: number,
  ): Promise<GeocodedAddress>;

  abstract geocode(address: string): Promise<GeocodedAddress>;

  abstract searchPlaces(
    query: string,
    latitude?: number,
    longitude?: number,
  ): Promise<PlacePrediction[]>;

  abstract getPlaceDetails(placeId: string): Promise<GeocodedAddress>;
}
