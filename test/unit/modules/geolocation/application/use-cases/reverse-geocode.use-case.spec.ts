import { ReverseGeocodeUseCase } from '@/modules/geolocation/application/use-cases/reverse-geocode.use-case';
import { GeocodingPort } from '@/modules/geolocation/domain/ports/geocoding.port';
import { GeocodedAddress } from '@/modules/geolocation/domain/value-objects/geocoded-address.vo';
import { DomainException } from '@/domain/exceptions/domain.exception';

describe('ReverseGeocodeUseCase', () => {
  let useCase: ReverseGeocodeUseCase;
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

    useCase = new ReverseGeocodeUseCase(geocodingPort);
  });

  it('should return geocoded address for valid coordinates', async () => {
    geocodingPort.reverseGeocode.mockResolvedValue(mockAddress);

    const result = await useCase.execute({
      latitude: 4.711,
      longitude: -74.0721,
    });

    expect(result).toEqual(mockAddress);
    expect(geocodingPort.reverseGeocode).toHaveBeenCalledWith(4.711, -74.0721);
  });

  it('should validate coordinates before calling port', async () => {
    await expect(
      useCase.execute({ latitude: 100, longitude: 0 }),
    ).rejects.toThrow(DomainException);

    expect(geocodingPort.reverseGeocode).not.toHaveBeenCalled();
  });

  it('should propagate port errors', async () => {
    geocodingPort.reverseGeocode.mockRejectedValue(
      new Error('API unavailable'),
    );

    await expect(
      useCase.execute({ latitude: 4.711, longitude: -74.0721 }),
    ).rejects.toThrow('API unavailable');
  });
});
