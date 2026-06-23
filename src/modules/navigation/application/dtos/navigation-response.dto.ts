import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RouteStepDto {
  @ApiProperty({ example: 'Girar a la derecha en Cra 7' })
  instruction: string;

  @ApiProperty({ example: '200 m' })
  distance: string;

  @ApiProperty({ example: '1 min' })
  duration: string;

  @ApiProperty({ example: 4.711 })
  startLat: number;

  @ApiProperty({ example: -74.072 })
  startLng: number;

  @ApiProperty({ example: 4.713 })
  endLat: number;

  @ApiProperty({ example: -74.075 })
  endLng: number;

  @ApiPropertyOptional({ example: 'turn-right' })
  maneuver?: string;
}

export class DriverNavigationViewDto {
  @ApiProperty({ example: 'session-uuid' })
  sessionId: string;

  @ApiProperty({ example: 'ACTIVE' })
  status: string;

  @ApiProperty({ type: [RouteStepDto] })
  route: RouteStepDto[];

  @ApiProperty({ example: 2, description: 'Índice del paso actual' })
  currentStepIndex: number;

  @ApiProperty({ example: 540, description: 'Segundos estimados al destino' })
  etaSeconds: number;

  @ApiProperty({ example: ['pass-uuid-1', 'pass-uuid-2'] })
  passengers: string[];
}

export class DriverLocationDto {
  @ApiProperty({ example: 4.715 })
  latitude: number;

  @ApiProperty({ example: -74.075 })
  longitude: number;

  @ApiProperty({ example: 90, description: 'Dirección en grados (0-360)' })
  heading: number;

  @ApiProperty({ example: 30, description: 'Velocidad en km/h' })
  speed: number;
}

export class PassengerNavigationViewDto {
  @ApiProperty({ example: 'session-uuid' })
  sessionId: string;

  @ApiProperty({ example: 'ACTIVE' })
  status: string;

  @ApiPropertyOptional({ type: DriverLocationDto })
  driverLocation?: DriverLocationDto;

  @ApiProperty({ example: 540 })
  etaSeconds: number;

  @ApiProperty({ example: 'encoded_polyline_string' })
  polyline: string;

  @ApiProperty({ example: 'Calle 100 #15-20, Bogotá' })
  startAddress: string;

  @ApiProperty({ example: 'Calle 26 #60-80, Bogotá' })
  endAddress: string;
}

export class NavigationStartResponseDto {
  @ApiProperty({ example: 'session-uuid' })
  id: string;

  @ApiProperty({ example: 'trip-uuid' })
  tripId: string;

  @ApiProperty({ example: 'ACTIVE' })
  status: string;

  @ApiProperty({ example: 4.711 })
  originLat: number;

  @ApiProperty({ example: -74.072 })
  originLng: number;

  @ApiProperty({ example: 4.609 })
  destinationLat: number;

  @ApiProperty({ example: -74.081 })
  destinationLng: number;
}
