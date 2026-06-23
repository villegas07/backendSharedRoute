import { ValueObject } from '../../../../domain/value-objects/value-object.base';

export interface CoordinatesProps {
  latitude: number;
  longitude: number;
}

export class CoordinatesValueObject extends ValueObject<CoordinatesProps> {
  static create(props: CoordinatesProps): CoordinatesValueObject {
    return new CoordinatesValueObject(props);
  }

  protected validate(props: CoordinatesProps): string | null {
    if (props.latitude < -90 || props.latitude > 90) {
      return 'Latitude must be between -90 and 90';
    }
    if (props.longitude < -180 || props.longitude > 180) {
      return 'Longitude must be between -180 and 180';
    }
    return null;
  }

  get latitude(): number {
    return this._value.latitude;
  }

  get longitude(): number {
    return this._value.longitude;
  }
}
