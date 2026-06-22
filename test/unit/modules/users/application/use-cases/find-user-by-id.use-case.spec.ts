import { NotFoundException } from '@nestjs/common';
import { FindUserByIdUseCase } from '@/modules/users/application/use-cases/find-user-by-id.use-case';
import { UserEntity, UserRole } from '@/modules/users/domain/entities/user.entity';

const buildUser = () =>
  UserEntity.create({ id: 'user-1', firstName: 'Juan', lastName: 'Pérez', email: 'j@t.com', phone: '123', passwordHash: 'h', role: UserRole.PASSENGER });

const buildMockRepo = () => ({ findById: jest.fn(), findAll: jest.fn(), findByEmail: jest.fn(), findByPhone: jest.fn(), findDrivers: jest.fn(), save: jest.fn(), update: jest.fn(), delete: jest.fn(), exists: jest.fn() });

describe('FindUserByIdUseCase', () => {
  let useCase: FindUserByIdUseCase;
  let mockRepo: ReturnType<typeof buildMockRepo>;

  beforeEach(() => {
    mockRepo = buildMockRepo();
    useCase = new FindUserByIdUseCase(mockRepo as any);
  });

  it('should return user DTO when found', async () => {
    mockRepo.findById.mockResolvedValue(buildUser());
    const result = await useCase.execute('user-1');
    expect(result.id).toBe('user-1');
  });

  it('should throw NotFoundException when user does not exist', async () => {
    mockRepo.findById.mockResolvedValue(null);
    await expect(useCase.execute('missing-id')).rejects.toThrow(NotFoundException);
  });
});
