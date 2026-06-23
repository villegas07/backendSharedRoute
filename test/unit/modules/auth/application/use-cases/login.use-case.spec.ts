import { UnauthorizedException } from '@nestjs/common';
import { LoginUseCase } from '@/modules/auth/application/use-cases/login.use-case';
import { UserEntity, UserRole } from '@/modules/users/domain/entities/user.entity';

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
}));

const buildUser = () =>
  UserEntity.create({ id: 'u1', firstName: 'Juan', lastName: 'P', email: 'juan@test.com', phone: '123', passwordHash: 'hashed', role: UserRole.DRIVER });

const buildMockUserRepo = () => ({
  findById: jest.fn(), findAll: jest.fn(), findByEmail: jest.fn(), findByPhone: jest.fn(), findDrivers: jest.fn(), save: jest.fn(), update: jest.fn(), delete: jest.fn(), exists: jest.fn(),
});

const buildMockTokenService = () => ({
  generateAccessToken: jest.fn().mockResolvedValue('access-token'),
  generateRefreshToken: jest.fn().mockResolvedValue('refresh-token'),
});

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;
  let mockUserRepo: ReturnType<typeof buildMockUserRepo>;
  let mockTokenService: ReturnType<typeof buildMockTokenService>;

  beforeEach(() => {
    mockUserRepo = buildMockUserRepo();
    mockTokenService = buildMockTokenService();
    useCase = new LoginUseCase(mockUserRepo as any, mockTokenService as any);
  });

  it('should return access and refresh tokens on valid credentials', async () => {
    const bcrypt = require('bcryptjs');
    bcrypt.compare.mockResolvedValue(true);
    mockUserRepo.findByEmail.mockResolvedValue(buildUser());

    const result = await useCase.execute({ email: 'juan@test.com', password: 'password123' });

    expect(result.accessToken).toBe('access-token');
    expect(result.refreshToken).toBe('refresh-token');
    expect(result.user.email).toBe('juan@test.com');
  });

  it('should throw UnauthorizedException when user not found', async () => {
    mockUserRepo.findByEmail.mockResolvedValue(null);
    await expect(useCase.execute({ email: 'x@x.com', password: 'pass' })).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException when password does not match', async () => {
    const bcrypt = require('bcryptjs');
    bcrypt.compare.mockResolvedValue(false);
    mockUserRepo.findByEmail.mockResolvedValue(buildUser());
    await expect(useCase.execute({ email: 'juan@test.com', password: 'wrong' })).rejects.toThrow(UnauthorizedException);
  });
});
