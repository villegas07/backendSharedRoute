import { GeocodeAddressUseCase } from '@/modules/geolocation/application/use-cases/geocode-address.use-case';
import { GeocodingPort } from '@/modules/geolocation/domain/ports/geocoding.port';
import { GeocodedAddress } from '@/modules/geolocation/domain/value-objects/geocoded-address.vo';

describe('GeocodeAddressUseCase', () => {
  let useCase: GeocodeAddressUseCase;
  let geocodingPort: jest.Mocked<GeocodingPort>;

  const mockAddress: GeocodedAddress = {
    formattedAddress: 'Calle 100 #15-20, Bogotá, Colombia',
    city: 'Bogotá',
    department: 'Bogotá D.C.',
    country: 'Colombia',
    postalCode: '110111',
    latitude: 4.711,
    longitude: -74.0721,
    placeId: 'ChIJ_test123',
  };

  beforeEach(() => {
    geocodingPort = {
      reverseGeocode: jest.fn(),
      geocode: jest.fn(),
      searchPlaces: jest.fn(),
      getPlaceDetails: jest.fn(),
    } as jest.Mocked<GeocodingPort>;

    useCase = new GeocodeAddressUseCase(geocodingPort);
  });

  it('should return geocoded address for a valid address string', async () => {
    geocodingPort.geocode.mockResolvedValue(mockAddress);

    const result = await useCase.execute('Calle 100 #15-20, Bogotá');

    expect(result).toEqual(mockAddress);
    expect(geocodingPort.geocode).toHaveBeenCalledWith(
      'Calle 100 #15-20, Bogotá',
    );
  });

  it('should propagate port errors', async () => {
    geocodingPort.geocode.mockRejectedValue(new Error('Not found'));

    await expect(
      useCase.execute('dirección inexistente'),
    ).rejects.toThrow('Not found');
  });
});
