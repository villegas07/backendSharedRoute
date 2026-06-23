export interface RouteStep {
  readonly instruction: string;
  readonly distance: string;
  readonly duration: string;
  readonly startLat: number;
  readonly startLng: number;
  readonly endLat: number;
  readonly endLng: number;
  readonly maneuver?: string;
}

export interface RouteInfo {
  readonly polyline: string;
  readonly distanceText: string;
  readonly distanceMeters: number;
  readonly durationText: string;
  readonly durationSeconds: number;
  readonly steps: RouteStep[];
  readonly startAddress: string;
  readonly endAddress: string;
}
