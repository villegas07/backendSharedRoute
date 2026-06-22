import { ValueObject } from '@/domain/value-objects/value-object.base';

class PositiveNumber extends ValueObject<number> {
  static create(value: number): PositiveNumber {
    return new PositiveNumber(value);
  }
  protected validate(value: number): string | null {
    return value > 0 ? null : 'Must be positive';
  }
}

describe('ValueObject', () => {
  it('should create a valid value object', () => {
    const vo = PositiveNumber.create(5);
    expect(vo.value).toBe(5);
  });

  it('should throw DomainException when validation fails', () => {
    expect(() => PositiveNumber.create(-1)).toThrow('Must be positive');
  });

  it('should be frozen (immutable)', () => {
    const vo = PositiveNumber.create(5);
    expect(Object.isFrozen(vo)).toBe(true);
  });

  it('should equal another VO with the same value', () => {
    const a = PositiveNumber.create(5);
    const b = PositiveNumber.create(5);
    expect(a.equals(b)).toBe(true);
  });

  it('should not equal a VO with a different value', () => {
    const a = PositiveNumber.create(3);
    const b = PositiveNumber.create(7);
    expect(a.equals(b)).toBe(false);
  });
});
