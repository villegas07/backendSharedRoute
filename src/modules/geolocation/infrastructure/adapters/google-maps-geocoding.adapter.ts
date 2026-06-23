import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  Client,
  GeocodeResult,
  Language,
  PlaceAutocompleteType,
} from '@googlemaps/google-maps-services-js';
import { GeocodingPort } from '../../domain/ports/geocoding.port';
import { GeocodedAddress } from '../../domain/value-objects/geocoded-address.vo';
import { PlacePrediction } from '../../domain/value-objects/place-prediction.vo';

@Injectable()
export class GoogleMapsGeocodingAdapter extends GeocodingPort {
  private readonly client: Client;
  private readonly apiKey: string;
  private readonly language: Language;
  private readonly region: string;

  constructor(private readonly configService: ConfigService) {
    super();
    this.client = new Client({});
    this.apiKey = this.configService.get<string>('googleMaps.apiKey', '');
    this.language = this.configService.get<string>('googleMaps.defaultLanguage', 'es') as Language;
    this.region = this.configService.get<string>('googleMaps.defaultRegion', 'co');
  }

  async reverseGeocode(
    latitude: number,
    longitude: number,
  ): Promise<GeocodedAddress> {
    const response = await this.safeCall(() =>
      this.client.reverseGeocode({
        params: {
          latlng: { lat: latitude, lng: longitude },
          language: this.language,
          key: this.apiKey,
        },
      }),
    );

    const result = response.data.results[0];
    if (!result) {
      throw new InternalServerErrorException(
        'No se encontró dirección para las coordenadas proporcionadas',
      );
    }
    return this.mapToGeocodedAddress(result as GeocodeResult);
  }

  async geocode(address: string): Promise<GeocodedAddress> {
    const response = await this.safeCall(() =>
      this.client.geocode({
        params: {
          address,
          language: this.language,
          region: this.region,
          key: this.apiKey,
        },
      }),
    );

    const result = response.data.results[0];
    if (!result) {
      throw new InternalServerErrorException(
        'No se encontró ubicación para la dirección proporcionada',
      );
    }
    return this.mapToGeocodedAddress(result as GeocodeResult);
  }

  async searchPlaces(
    query: string,
    latitude?: number,
    longitude?: number,
  ): Promise<PlacePrediction[]> {
    const params: Record<string, unknown> = {
      input: query,
      language: this.language,
      components: [`country:${this.region}`],
      types: PlaceAutocompleteType.geocode,
      key: this.apiKey,
    };

    if (latitude !== undefined && longitude !== undefined) {
      params.location = { lat: latitude, lng: longitude };
      params.radius = 50000;
    }

    const response = await this.safeCall(() =>
      this.client.placeAutocomplete({ params: params as never }),
    );

    return response.data.predictions.map((p) => ({
      placeId: p.place_id,
      description: p.description,
      mainText: p.structured_formatting.main_text,
      secondaryText: p.structured_formatting.secondary_text,
    }));
  }

  async getPlaceDetails(placeId: string): Promise<GeocodedAddress> {
    const response = await this.safeCall(() =>
      this.client.placeDetails({
        params: {
          place_id: placeId,
          fields: [
            'formatted_address',
            'geometry',
            'address_components',
            'place_id',
          ],
          language: this.language,
          key: this.apiKey,
        },
      }),
    );

    const result = response.data.result;
    return {
      formattedAddress: result.formatted_address || '',
      city: this.extractComponent(result.address_components, 'locality'),
      department: this.extractComponent(
        result.address_components,
        'administrative_area_level_1',
      ),
      country: this.extractComponent(result.address_components, 'country'),
      postalCode: this.extractComponent(
        result.address_components,
        'postal_code',
      ),
      latitude: result.geometry?.location?.lat || 0,
      longitude: result.geometry?.location?.lng || 0,
      placeId: result.place_id || placeId,
    };
  }

  private mapToGeocodedAddress(result: GeocodeResult): GeocodedAddress {
    const components = result.address_components;
    const geometry = result.geometry;

    return {
      formattedAddress: result.formatted_address || '',
      city: this.extractComponent(components, 'locality'),
      department: this.extractComponent(
        components,
        'administrative_area_level_1',
      ),
      country: this.extractComponent(components, 'country'),
      postalCode: this.extractComponent(components, 'postal_code'),
      latitude: geometry?.location?.lat || 0,
      longitude: geometry?.location?.lng || 0,
      placeId: result.place_id || '',
    };
  }

  private extractComponent(
    components: Array<{ long_name: string; types: string[] }> | undefined,
    type: string,
  ): string {
    if (!components) return '';
    const found = components.find((c) => c.types.includes(type));
    return found?.long_name || '';
  }

  private async safeCall<T>(fn: () => Promise<T>): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Google Maps API error';
      throw new InternalServerErrorException(
        `Error en servicio de geolocalización: ${message}`,
      );
    }
  }
}
