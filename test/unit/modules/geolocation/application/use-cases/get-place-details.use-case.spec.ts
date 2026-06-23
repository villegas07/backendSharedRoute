import { GetPlaceDetailsUseCase } from '@/modules/geolocation/application/use-cases/get-place-details.use-case';
import { GeocodingPort } from '@/modules/geolocation/domain/ports/geocoding.port';
import { GeocodedAddress } from '@/modules/geolocation/domain/value-objects/geocoded-address.vo';

describe('GetPlaceDetailsUseCase', () => {
  let useCase: GetPlaceDetailsUseCase;
  let geocodingPort: jest.Mocked<GeocodingPort>;

  const mockAddress: GeocodedAddress = {
    formattedAddress: 'Centro Comercial Andino, Bogotá, Colombia',
    city: 'Bogotá',
    department: 'Bogotá D.C.',
    country: 'Colombia',
    postalCode: '110111',
    latitude: 4.6667,
    longitude: -74.0528,
    placeId: 'ChIJ_andino',
  };

  beforeEach(() => {
    geocodingPort = {
      reverseGeocode: jest.fn(),
      geocode: jest.fn(),
      searchPlaces: jest.fn(),
      getPlaceDetails: jest.fn(),
    } as jest.Mocked<GeocodingPort>;

    useCase = new GetPlaceDetailsUseCase(geocodingPort);
  });

  it('should return place details for a valid placeId', async () => {
    geocodingPort.getPlaceDetails.mockResolvedValue(mockAddress);

    const result = await useCase.execute('ChIJ_andino');

    expect(result).toEqual(mockAddress);
    expect(geocodingPort.getPlaceDetails).toHaveBeenCalledWith('ChIJ_andino');
  });

  it('should propagate port errors', async () => {
    geocodingPort.getPlaceDetails.mockRejectedValue(
      new Error('Place not found'),
    );

    await expect(
      useCase.execute('invalid_place_id'),
    ).rejects.toThrow('Place not found');
  });
});
