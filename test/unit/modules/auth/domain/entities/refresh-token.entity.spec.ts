import { RefreshTokenEntity } from '@/modules/auth/domain/entities/refresh-token.entity';

const future = () => new Date(Date.now() + 60_000);
const past = () => new Date(Date.now() - 60_000);

const buildProps = (overrides = {}) => ({
  userId: 'user-1',
  token: 'token-abc',
  expiresAt: future(),
  ...overrides,
});

describe('RefreshTokenEntity', () => {
  it('should create with isRevoked = false by default', () => {
    const token = RefreshTokenEntity.create(buildProps());
    expect(token.isRevoked).toBe(false);
  });

  describe('isExpired', () => {
    it('should return false when expiresAt is in the future', () => {
      const token = RefreshTokenEntity.create(buildProps());
      expect(token.isExpired()).toBe(false);
    });

    it('should return true when expiresAt is in the past', () => {
      const token = RefreshTokenEntity.create(buildProps({ expiresAt: past() }));
      expect(token.isExpired()).toBe(true);
    });
  });

  describe('isValid', () => {
    it('should return true when not revoked and not expired', () => {
      const token = RefreshTokenEntity.create(buildProps());
      expect(token.isValid()).toBe(true);
    });

    it('should return false when revoked', () => {
      const token = RefreshTokenEntity.create(buildProps());
      token.revoke();
      expect(token.isValid()).toBe(false);
    });

    it('should return false when expired', () => {
      const token = RefreshTokenEntity.create(buildProps({ expiresAt: past() }));
      expect(token.isValid()).toBe(false);
    });
  });

  describe('revoke', () => {
    it('should set isRevoked to true', () => {
      const token = RefreshTokenEntity.create(buildProps());
      token.revoke();
      expect(token.isRevoked).toBe(true);
    });
  });
});
