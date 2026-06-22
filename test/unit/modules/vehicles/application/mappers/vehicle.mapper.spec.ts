import { VehicleEntity, VehicleStatus } from '@/modules/vehicles/domain/entities/vehicle.entity';
import { VehicleMapper } from '@/modules/vehicles/application/mappers/vehicle.mapper';

const buildVehicle = () =>
  VehicleEntity.create({
    id: 'v-1',
    ownerId: 'owner-1',
    brand: 'Toyota',
    model: 'Corolla',
    year: 2020,
    plate: 'ABC123',
    color: 'Blanco',
    totalSeats: 4,
    status: VehicleStatus.ACTIVE,
  });

describe('VehicleMapper', () => {
  it('should map all fields', () => {
    const dto = VehicleMapper.toResponse(buildVehicle());
    expect(dto.displayName).toBe('2020 Toyota Corolla');
    expect(dto.plate).toBe('ABC123');
    expect(dto.totalSeats).toBe(4);
  });

  it('toResponseList should map each vehicle', () => {
    const dtos = VehicleMapper.toResponseList([buildVehicle(), buildVehicle()]);
    expect(dtos).toHaveLength(2);
  });
});
