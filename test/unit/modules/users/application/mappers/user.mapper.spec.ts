import { UserEntity, UserRole, UserStatus } from '@/modules/users/domain/entities/user.entity';
import { UserMapper } from '@/modules/users/application/mappers/user.mapper';

const buildUser = () =>
  UserEntity.create({
    id: 'user-1',
    firstName: 'Juan',
    lastName: 'Pérez',
    email: 'juan@test.com',
    phone: '+573001234567',
    passwordHash: 'hash',
    role: UserRole.DRIVER,
    status: UserStatus.ACTIVE,
  });

describe('UserMapper', () => {
  describe('toResponse', () => {
    it('should map all fields correctly', () => {
      const user = buildUser();
      const dto = UserMapper.toResponse(user);
      expect(dto.id).toBe('user-1');
      expect(dto.fullName).toBe('Juan Pérez');
      expect(dto.email).toBe('juan@test.com');
      expect(dto.role).toBe(UserRole.DRIVER);
      expect(dto.status).toBe(UserStatus.ACTIVE);
    });

    it('should not expose passwordHash', () => {
      const user = buildUser();
      const dto = UserMapper.toResponse(user) as any;
      expect(dto.passwordHash).toBeUndefined();
    });
  });

  describe('toResponseList', () => {
    it('should map each entity in the list', () => {
      const users = [buildUser(), buildUser()];
      const dtos = UserMapper.toResponseList(users);
      expect(dtos).toHaveLength(2);
    });
  });
});
