import { LocationValueObject } from '@/modules/trips/domain/value-objects/location.vo';
import { DomainException } from '@/domain/exceptions/domain.exception';

const validLocation = () => ({
  latitude: 4.711,
  longitude: -74.072,
  address: 'Cra 7 # 32-18',
  city: 'Bogotá',
});

describe('LocationValueObject', () => {
  it('should create with valid data', () => {
    const loc = LocationValueObject.create(validLocation());
    expect(loc.city).toBe('Bogotá');
    expect(loc.latitude).toBe(4.711);
  });

  it('should throw for invalid latitude (<-90)', () => {
    expect(() => LocationValueObject.create({ ...validLocation(), latitude: -91 })).toThrow(DomainException);
  });

  it('should throw for invalid latitude (>90)', () => {
    expect(() => LocationValueObject.create({ ...validLocation(), latitude: 91 })).toThrow(DomainException);
  });

  it('should throw for invalid longitude (<-180)', () => {
    expect(() => LocationValueObject.create({ ...validLocation(), longitude: -181 })).toThrow(DomainException);
  });

  it('should throw for invalid longitude (>180)', () => {
    expect(() => LocationValueObject.create({ ...validLocation(), longitude: 181 })).toThrow(DomainException);
  });

  it('should throw for empty address', () => {
    expect(() => LocationValueObject.create({ ...validLocation(), address: '' })).toThrow(DomainException);
  });

  it('should throw for empty city', () => {
    expect(() => LocationValueObject.create({ ...validLocation(), city: '' })).toThrow(DomainException);
  });

  it('should equal another VO with same values', () => {
    const a = LocationValueObject.create(validLocation());
    const b = LocationValueObject.create(validLocation());
    expect(a.equals(b)).toBe(true);
  });

  it('should be immutable (frozen)', () => {
    const loc = LocationValueObject.create(validLocation());
    expect(Object.isFrozen(loc)).toBe(true);
  });
});
