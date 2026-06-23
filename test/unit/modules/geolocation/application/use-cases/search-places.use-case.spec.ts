import { SearchPlacesUseCase } from '@/modules/geolocation/application/use-cases/search-places.use-case';
import { GeocodingPort } from '@/modules/geolocation/domain/ports/geocoding.port';
import { PlacePrediction } from '@/modules/geolocation/domain/value-objects/place-prediction.vo';

describe('SearchPlacesUseCase', () => {
  let useCase: SearchPlacesUseCase;
  let geocodingPort: jest.Mocked<GeocodingPort>;

  const mockPredictions: PlacePrediction[] = [
    {
      placeId: 'ChIJ_test1',
      description: 'Centro Comercial Andino, Bogotá',
      mainText: 'Centro Comercial Andino',
      secondaryText: 'Bogotá, Colombia',
    },
    {
      placeId: 'ChIJ_test2',
      description: 'Centro Comercial Atlantis, Bogotá',
      mainText: 'Centro Comercial Atlantis',
      secondaryText: 'Bogotá, Colombia',
    },
  ];

  beforeEach(() => {
    geocodingPort = {
      reverseGeocode: jest.fn(),
      geocode: jest.fn(),
      searchPlaces: jest.fn(),
      getPlaceDetails: jest.fn(),
    } as jest.Mocked<GeocodingPort>;

    useCase = new SearchPlacesUseCase(geocodingPort);
  });

  it('should return place predictions for a query', async () => {
    geocodingPort.searchPlaces.mockResolvedValue(mockPredictions);

    const result = await useCase.execute({ query: 'Centro Comercial' });

    expect(result).toEqual(mockPredictions);
    expect(geocodingPort.searchPlaces).toHaveBeenCalledWith(
      'Centro Comercial',
      undefined,
      undefined,
    );
  });

  it('should pass location bias when provided', async () => {
    geocodingPort.searchPlaces.mockResolvedValue(mockPredictions);

    await useCase.execute({
      query: 'Centro',
      latitude: 4.711,
      longitude: -74.0721,
    });

    expect(geocodingPort.searchPlaces).toHaveBeenCalledWith(
      'Centro',
      4.711,
      -74.0721,
    );
  });

  it('should return empty array when no predictions found', async () => {
    geocodingPort.searchPlaces.mockResolvedValue([]);

    const result = await useCase.execute({ query: 'xyznonexistent' });

    expect(result).toEqual([]);
  });

  it('should propagate port errors', async () => {
    geocodingPort.searchPlaces.mockRejectedValue(new Error('API error'));

    await expect(
      useCase.execute({ query: 'Centro' }),
    ).rejects.toThrow('API error');
  });
});
