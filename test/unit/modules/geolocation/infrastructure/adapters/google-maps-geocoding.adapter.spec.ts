import { ConfigService } from '@nestjs/config';
import { InternalServerErrorException } from '@nestjs/common';
import { GoogleMapsGeocodingAdapter } from '@/modules/geolocation/infrastructure/adapters/google-maps-geocoding.adapter';

jest.mock('@googlemaps/google-maps-services-js', () => {
  const mockClient = {
    reverseGeocode: jest.fn(),
    geocode: jest.fn(),
    placeAutocomplete: jest.fn(),
    placeDetails: jest.fn(),
  };
  return {
    Client: jest.fn().mockImplementation(() => mockClient),
    PlaceAutocompleteType: { geocode: 'geocode' },
    Language: { es: 'es' },
  };
});

describe('GoogleMapsGeocodingAdapter', () => {
  let adapter: GoogleMapsGeocodingAdapter;
  let mockClient: Record<string, jest.Mock>;
  let configService: ConfigService;

  const geocodeResult = {
    formatted_address: 'Calle 100 #15-20, Bogotá, Colombia',
    place_id: 'ChIJ_test123',
    address_components: [
      { long_name: 'Bogotá', types: ['locality'] },
      { long_name: 'Bogotá D.C.', types: ['administrative_area_level_1'] },
      { long_name: 'Colombia', types: ['country'] },
      { long_name: '110111', types: ['postal_code'] },
    ],
    geometry: { location: { lat: 4.711, lng: -74.0721 } },
  };

  beforeEach(() => {
    configService = {
      get: jest.fn((key: string, defaultValue?: string) => {
        const config: Record<string, string> = {
          'googleMaps.apiKey': 'test-api-key',
          'googleMaps.defaultLanguage': 'es',
          'googleMaps.defaultRegion': 'co',
        };
        return config[key] || defaultValue || '';
      }),
    } as unknown as ConfigService;

    adapter = new GoogleMapsGeocodingAdapter(configService);

    const { Client } = jest.requireMock(
      '@googlemaps/google-maps-services-js',
    );
    mockClient = new Client();
  });

  describe('reverseGeocode', () => {
    it('should return geocoded address', async () => {
      mockClient.reverseGeocode.mockResolvedValue({
        data: { results: [geocodeResult] },
      });

      const result = await adapter.reverseGeocode(4.711, -74.0721);

      expect(result.formattedAddress).toBe(
        'Calle 100 #15-20, Bogotá, Colombia',
      );
      expect(result.city).toBe('Bogotá');
      expect(result.latitude).toBe(4.711);
    });

    it('should throw when no results', async () => {
      mockClient.reverseGeocode.mockResolvedValue({
        data: { results: [] },
      });

      await expect(
        adapter.reverseGeocode(0, 0),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should wrap API errors', async () => {
      mockClient.reverseGeocode.mockRejectedValue(
        new Error('Network error'),
      );

      await expect(
        adapter.reverseGeocode(4.711, -74.0721),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('geocode', () => {
    it('should return geocoded address for a text address', async () => {
      mockClient.geocode.mockResolvedValue({
        data: { results: [geocodeResult] },
      });

      const result = await adapter.geocode('Calle 100, Bogotá');

      expect(result.city).toBe('Bogotá');
      expect(result.placeId).toBe('ChIJ_test123');
    });

    it('should throw when no results', async () => {
      mockClient.geocode.mockResolvedValue({
        data: { results: [] },
      });

      await expect(
        adapter.geocode('xyznonexistent'),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('searchPlaces', () => {
    it('should return place predictions', async () => {
      mockClient.placeAutocomplete.mockResolvedValue({
        data: {
          predictions: [
            {
              place_id: 'ChIJ_1',
              description: 'Centro Comercial Andino',
              structured_formatting: {
                main_text: 'Centro Comercial Andino',
                secondary_text: 'Bogotá',
              },
            },
          ],
        },
      });

      const result = await adapter.searchPlaces('Centro');

      expect(result).toHaveLength(1);
      expect(result[0].placeId).toBe('ChIJ_1');
      expect(result[0].mainText).toBe('Centro Comercial Andino');
    });

    it('should return empty array when no predictions', async () => {
      mockClient.placeAutocomplete.mockResolvedValue({
        data: { predictions: [] },
      });

      const result = await adapter.searchPlaces('xyznonexistent');

      expect(result).toEqual([]);
    });
  });

  describe('getPlaceDetails', () => {
    it('should return place details', async () => {
      mockClient.placeDetails.mockResolvedValue({
        data: {
          result: {
            formatted_address: 'Centro Comercial Andino, Bogotá',
            place_id: 'ChIJ_andino',
            address_components: [
              { long_name: 'Bogotá', types: ['locality'] },
            ],
            geometry: { location: { lat: 4.6667, lng: -74.0528 } },
          },
        },
      });

      const result = await adapter.getPlaceDetails('ChIJ_andino');

      expect(result.placeId).toBe('ChIJ_andino');
      expect(result.latitude).toBe(4.6667);
    });
  });
});
