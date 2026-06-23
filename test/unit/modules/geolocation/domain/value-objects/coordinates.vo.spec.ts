import { CoordinatesValueObject } from '@/modules/geolocation/domain/value-objects/coordinates.vo';
import { DomainException } from '@/domain/exceptions/domain.exception';

describe('CoordinatesValueObject', () => {
  it('should create valid coordinates', () => {
    const coords = CoordinatesValueObject.create({
      latitude: 4.711,
      longitude: -74.0721,
    });

    expect(coords.latitude).toBe(4.711);
    expect(coords.longitude).toBe(-74.0721);
  });

  it('should create coordinates at boundaries', () => {
    const coords = CoordinatesValueObject.create({
      latitude: 90,
      longitude: 180,
    });

    expect(coords.latitude).toBe(90);
    expect(coords.longitude).toBe(180);
  });

  it('should throw for latitude > 90', () => {
    expect(() =>
      CoordinatesValueObject.create({ latitude: 91, longitude: 0 }),
    ).toThrow(DomainException);
  });

  it('should throw for latitude < -90', () => {
    expect(() =>
      CoordinatesValueObject.create({ latitude: -91, longitude: 0 }),
    ).toThrow(DomainException);
  });

  it('should throw for longitude > 180', () => {
    expect(() =>
      CoordinatesValueObject.create({ latitude: 0, longitude: 181 }),
    ).toThrow(DomainException);
  });

  it('should throw for longitude < -180', () => {
    expect(() =>
      CoordinatesValueObject.create({ latitude: 0, longitude: -181 }),
    ).toThrow(DomainException);
  });

  it('should be immutable (frozen)', () => {
    const coords = CoordinatesValueObject.create({
      latitude: 4.711,
      longitude: -74.0721,
    });

    expect(Object.isFrozen(coords)).toBe(true);
  });

  it('should be equal to another VO with same values', () => {
    const a = CoordinatesValueObject.create({ latitude: 10, longitude: 20 });
    const b = CoordinatesValueObject.create({ latitude: 10, longitude: 20 });

    expect(a.equals(b)).toBe(true);
  });

  it('should not be equal to another VO with different values', () => {
    const a = CoordinatesValueObject.create({ latitude: 10, longitude: 20 });
    const b = CoordinatesValueObject.create({ latitude: 11, longitude: 20 });

    expect(a.equals(b)).toBe(false);
  });
});
