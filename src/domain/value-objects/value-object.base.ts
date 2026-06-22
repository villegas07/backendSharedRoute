import { DomainException } from '../exceptions/domain.exception';

export abstract class ValueObject<T> {
  protected readonly _value: T;

  protected constructor(value: T) {
    this.validateOrThrow(value);
    this._value = value;
    Object.freeze(this);
  }

  private validateOrThrow(value: T): void {
    const error = this.validate(value);
    if (error) throw new DomainException(error, 'INVALID_VALUE_OBJECT');
  }

  protected abstract validate(value: T): string | null;

  get value(): T {
    return this._value;
  }

  equals(other: ValueObject<T>): boolean {
    return JSON.stringify(this._value) === JSON.stringify(other._value);
  }
}
