export interface DriverLocationUpdate {
  readonly latitude: number;
  readonly longitude: number;
  readonly heading: number;
  readonly speed: number;
  readonly timestamp: Date;
}
