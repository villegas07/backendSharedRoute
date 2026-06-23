import { EmergencyContactEntity } from '@/modules/sos/domain/entities/emergency-contact.entity';
import { DomainException } from '@/domain/exceptions/domain.exception';

describe('EmergencyContactEntity', () => {
  describe('create()', () => {
    it('should create a contact with valid data', () => {
      const contact = EmergencyContactEntity.create({
        userId: 'user-1',
        name: 'María García',
        phone: '+573001234567',
        relationship: 'Mamá',
      });

      expect(contact.id).toBeDefined();
      expect(contact.userId).toBe('user-1');
      expect(contact.name).toBe('María García');
      expect(contact.phone).toBe('+573001234567');
      expect(contact.relationship).toBe('Mamá');
    });

    it('should create a contact with local Colombian number', () => {
      const contact = EmergencyContactEntity.create({
        userId: 'user-1',
        name: 'Pedro',
        phone: '3001234567',
      });

      expect(contact.phone).toBe('3001234567');
    });

    it('should create a contact without relationship (optional)', () => {
      const contact = EmergencyContactEntity.create({
        userId: 'user-1',
        name: 'Juan',
        phone: '3001234567',
      });

      expect(contact.relationship).toBeUndefined();
    });

    // RED tests — require validation not yet implemented
    it('should throw DomainException if name is empty', () => {
      expect(() =>
        EmergencyContactEntity.create({
          userId: 'user-1',
          name: '',
          phone: '3001234567',
        }),
      ).toThrow(DomainException);
    });

    it('should throw DomainException if phone is empty', () => {
      expect(() =>
        EmergencyContactEntity.create({
          userId: 'user-1',
          name: 'Ana',
          phone: '',
        }),
      ).toThrow(DomainException);
    });

    it('should throw DomainException for invalid phone (letters)', () => {
      expect(() =>
        EmergencyContactEntity.create({
          userId: 'user-1',
          name: 'Ana',
          phone: 'abc123',
        }),
      ).toThrow(DomainException);
    });

    it('should throw DomainException for phone too short (< 7 digits)', () => {
      expect(() =>
        EmergencyContactEntity.create({
          userId: 'user-1',
          name: 'Ana',
          phone: '123',
        }),
      ).toThrow(DomainException);
    });

    it('should throw DomainException for phone too long (> 15 digits)', () => {
      expect(() =>
        EmergencyContactEntity.create({
          userId: 'user-1',
          name: 'Ana',
          phone: '1234567890123456',
        }),
      ).toThrow(DomainException);
    });

    it('should throw DomainException if userId is empty', () => {
      expect(() =>
        EmergencyContactEntity.create({
          userId: '',
          name: 'Ana',
          phone: '3001234567',
        }),
      ).toThrow(DomainException);
    });
  });

  describe('update()', () => {
    it('should update name, phone and relationship', () => {
      const contact = EmergencyContactEntity.create({
        userId: 'user-1',
        name: 'Old Name',
        phone: '3001234567',
      });

      contact.update('New Name', '+573109876543', 'Papá');

      expect(contact.name).toBe('New Name');
      expect(contact.phone).toBe('+573109876543');
      expect(contact.relationship).toBe('Papá');
    });

    it('should throw DomainException when updating with invalid phone', () => {
      const contact = EmergencyContactEntity.create({
        userId: 'user-1',
        name: 'Old Name',
        phone: '3001234567',
      });

      expect(() => contact.update('New Name', 'invalid-phone')).toThrow(
        DomainException,
      );
    });

    it('should throw DomainException when updating with empty name', () => {
      const contact = EmergencyContactEntity.create({
        userId: 'user-1',
        name: 'Old Name',
        phone: '3001234567',
      });

      expect(() => contact.update('', '3001234567')).toThrow(DomainException);
    });
  });
});
