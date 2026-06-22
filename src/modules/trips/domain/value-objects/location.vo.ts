import { ValueObject } from '../../../../domain/value-objects/value-object.base';

export interface LocationProps {
  latitude: number;
  longitude: number;
  address: string;
  city: string;
}

export class LocationValueObject extends ValueObject<LocationProps> {
  static create(props: LocationProps): LocationValueObject {
    return new LocationValueObject(props);
  }

  protected validate(props: LocationProps): string | null {
    if (props.latitude < -90 || props.latitude > 90) return 'Invalid latitude';
    if (props.longitude < -180 || props.longitude > 180) return 'Invalid longitude';
    if (!props.address?.trim()) return 'Address is required';
    if (!props.city?.trim()) return 'City is required';
    return null;
  }

  get latitude(): number {
    return this._value.latitude;
  }

  get longitude(): number {
    return this._value.longitude;
  }

  get address(): string {
    return this._value.address;
  }

  get city(): string {
    return this._value.city;
  }
}
