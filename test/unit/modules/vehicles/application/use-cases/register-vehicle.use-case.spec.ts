import { ConflictException } from '@nestjs/common';
import { RegisterVehicleUseCase } from '@/modules/vehicles/application/use-cases/register-vehicle.use-case';
import { VehicleEntity, VehicleStatus } from '@/modules/vehicles/domain/entities/vehicle.entity';

const buildMockRepo = () => ({
  findById: jest.fn(), findAll: jest.fn(), findByOwnerId: jest.fn(), findByPlate: jest.fn(), save: jest.fn(), update: jest.fn(), delete: jest.fn(), exists: jest.fn(),
});

const buildDto = (overrides = {}) => ({
  brand: 'Toyota', model: 'Corolla', year: 2020, plate: 'ABC123', color: 'Blanco', totalSeats: 4, ...overrides,
});

const buildSavedVehicle = () =>
  VehicleEntity.create({ id: 'v-1', ownerId: 'owner-1', brand: 'Toyota', model: 'Corolla', year: 2020, plate: 'ABC123', color: 'Blanco', totalSeats: 4, status: VehicleStatus.PENDING_INSPECTION });

describe('RegisterVehicleUseCase', () => {
  let useCase: RegisterVehicleUseCase;
  let mockRepo: ReturnType<typeof buildMockRepo>;

  beforeEach(() => {
    mockRepo = buildMockRepo();
    useCase = new RegisterVehicleUseCase(mockRepo as any);
  });

  it('should register a vehicle successfully', async () => {
    mockRepo.findByPlate.mockResolvedValue(null);
    mockRepo.save.mockResolvedValue(buildSavedVehicle());

    const result = await useCase.execute({ ownerId: 'owner-1', dto: buildDto() });

    expect(result.plate).toBe('ABC123');
    expect(result.ownerId).toBe('owner-1');
  });

  it('should throw ConflictException when plate already exists', async () => {
    mockRepo.findByPlate.mockResolvedValue(buildSavedVehicle());
    await expect(useCase.execute({ ownerId: 'owner-1', dto: buildDto() })).rejects.toThrow(ConflictException);
  });
});
