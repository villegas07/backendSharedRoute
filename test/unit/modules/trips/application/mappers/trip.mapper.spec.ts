import { TripEntity, TripStatus } from '@/modules/trips/domain/entities/trip.entity';
import { LocationValueObject } from '@/modules/trips/domain/value-objects/location.vo';
import { TripMapper } from '@/modules/trips/application/mappers/trip.mapper';

const loc = (city: string) =>
  LocationValueObject.create({ latitude: 4.7, longitude: -74.0, address: 'Cra 7', city });

const buildTrip = () =>
  TripEntity.create({
    id: 'trip-1',
    driverId: 'driver-1',
    vehicleId: 'vehicle-1',
    origin: loc('Bogotá'),
    destination: loc('Medellín'),
    departureAt: new Date(Date.now() + 3_600_000),
    availableSeats: 3,
    pricePerSeat: 15000,
  });

describe('TripMapper', () => {
  it('should map origin and destination cities', () => {
    const dto = TripMapper.toResponse(buildTrip());
    expect(dto.originCity).toBe('Bogotá');
    expect(dto.destinationCity).toBe('Medellín');
    expect(dto.pricePerSeat).toBe(15000);
  });

  it('toResponseList should map each trip', () => {
    const dtos = TripMapper.toResponseList([buildTrip(), buildTrip()]);
    expect(dtos).toHaveLength(2);
  });
});
