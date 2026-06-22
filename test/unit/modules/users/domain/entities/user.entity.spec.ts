import { UserEntity, UserRole, UserStatus } from '@/modules/users/domain/entities/user.entity';
import { DomainException } from '@/domain/exceptions/domain.exception';

const buildProps = (overrides = {}) => ({
  firstName: 'Juan',
  lastName: 'Pérez',
  email: 'juan@test.com',
  phone: '+573001234567',
  passwordHash: 'hashed_password',
  role: UserRole.PASSENGER,
  ...overrides,
});

describe('UserEntity', () => {
  describe('create', () => {
    it('should create a user with PENDING_VERIFICATION status by default', () => {
      const user = UserEntity.create(buildProps());
      expect(user.status).toBe(UserStatus.PENDING_VERIFICATION);
    });

    it('should auto-assign an id', () => {
      const user = UserEntity.create(buildProps());
      expect(user.id).toBeDefined();
    });

    it('should store provided props', () => {
      const user = UserEntity.create(buildProps());
      expect(user.email).toBe('juan@test.com');
      expect(user.role).toBe(UserRole.PASSENGER);
    });

    it('should use provided id', () => {
      const user = UserEntity.create(buildProps({ id: 'custom-id' }));
      expect(user.id).toBe('custom-id');
    });
  });

  describe('fullName', () => {
    it('should return concatenated first and last name', () => {
      const user = UserEntity.create(buildProps());
      expect(user.fullName).toBe('Juan Pérez');
    });
  });

  describe('isDriver', () => {
    it('should return true for DRIVER role', () => {
      const user = UserEntity.create(buildProps({ role: UserRole.DRIVER }));
      expect(user.isDriver()).toBe(true);
    });

    it('should return false for PASSENGER role', () => {
      const user = UserEntity.create(buildProps());
      expect(user.isDriver()).toBe(false);
    });
  });

  describe('isActive', () => {
    it('should return false by default', () => {
      const user = UserEntity.create(buildProps());
      expect(user.isActive()).toBe(false);
    });

    it('should return true after activate()', () => {
      const user = UserEntity.create(buildProps());
      user.activate();
      expect(user.isActive()).toBe(true);
    });
  });

  describe('activate', () => {
    it('should set status to ACTIVE', () => {
      const user = UserEntity.create(buildProps());
      user.activate();
      expect(user.status).toBe(UserStatus.ACTIVE);
    });
  });

  describe('suspend', () => {
    it('should set status to SUSPENDED', () => {
      const user = UserEntity.create(buildProps({ role: UserRole.DRIVER }));
      user.suspend();
      expect(user.status).toBe(UserStatus.SUSPENDED);
    });

    it('should throw DomainException when suspending an ADMIN', () => {
      const admin = UserEntity.create(buildProps({ role: UserRole.ADMIN }));
      expect(() => admin.suspend()).toThrow(DomainException);
    });
  });
});
