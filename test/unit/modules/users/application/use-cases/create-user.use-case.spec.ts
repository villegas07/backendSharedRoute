import { ConflictException } from '@nestjs/common';
import { CreateUserUseCase } from '@/modules/users/application/use-cases/create-user.use-case';
import { UserEntity, UserRole, UserStatus } from '@/modules/users/domain/entities/user.entity';

jest.mock('bcryptjs', () => ({ hash: jest.fn().mockResolvedValue('hashed_pass') }));

const buildMockRepo = () => ({
  findById: jest.fn(),
  findAll: jest.fn(),
  findByEmail: jest.fn(),
  findByPhone: jest.fn(),
  findDrivers: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  exists: jest.fn(),
});

const buildDto = (overrides = {}) => ({
  firstName: 'Juan',
  lastName: 'Pérez',
  email: 'juan@test.com',
  phone: '+573001234567',
  password: 'password123',
  ...overrides,
});

const buildSavedUser = () =>
  UserEntity.create({
    id: 'user-1',
    firstName: 'Juan',
    lastName: 'Pérez',
    email: 'juan@test.com',
    phone: '+573001234567',
    passwordHash: 'hashed_pass',
    role: UserRole.PASSENGER,
    status: UserStatus.PENDING_VERIFICATION,
  });

describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase;
  let mockRepo: ReturnType<typeof buildMockRepo>;

  beforeEach(() => {
    mockRepo = buildMockRepo();
    useCase = new CreateUserUseCase(mockRepo as any);
  });

  it('should create a user successfully', async () => {
    mockRepo.findByEmail.mockResolvedValue(null);
    mockRepo.save.mockResolvedValue(buildSavedUser());

    const result = await useCase.execute(buildDto());

    expect(result.email).toBe('juan@test.com');
    expect(result.role).toBe(UserRole.PASSENGER);
    expect(mockRepo.save).toHaveBeenCalledTimes(1);
  });

  it('should use PASSENGER role by default', async () => {
    mockRepo.findByEmail.mockResolvedValue(null);
    mockRepo.save.mockResolvedValue(buildSavedUser());

    await useCase.execute(buildDto());

    const savedEntity = mockRepo.save.mock.calls[0][0] as UserEntity;
    expect(savedEntity.role).toBe(UserRole.PASSENGER);
  });

  it('should throw ConflictException when email is already registered', async () => {
    mockRepo.findByEmail.mockResolvedValue(buildSavedUser());

    await expect(useCase.execute(buildDto())).rejects.toThrow(ConflictException);
    expect(mockRepo.save).not.toHaveBeenCalled();
  });

  it('should hash the password before saving', async () => {
    const bcrypt = require('bcryptjs');
    mockRepo.findByEmail.mockResolvedValue(null);
    mockRepo.save.mockResolvedValue(buildSavedUser());

    await useCase.execute(buildDto({ password: 'rawpassword' }));

    expect(bcrypt.hash).toHaveBeenCalledWith('rawpassword', expect.any(Number));
  });
});
