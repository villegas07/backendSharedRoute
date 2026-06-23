import { RouteInfo } from '../value-objects/route-info.vo';

export abstract class DirectionsPort {
  abstract getDirections(
    originLat: number,
    originLng: number,
    destinationLat: number,
    destinationLng: number,
  ): Promise<RouteInfo>;

  abstract getEtaSeconds(
    currentLat: number,
    currentLng: number,
    destinationLat: number,
    destinationLng: number,
  ): Promise<number>;
}
