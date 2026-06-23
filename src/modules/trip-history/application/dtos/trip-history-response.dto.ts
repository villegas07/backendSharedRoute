import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TripLocationSnapshotDto {
  @ApiProperty({ example: 4.711 })
  latitude: number;

  @ApiProperty({ example: -74.0721 })
  longitude: number;

  @ApiProperty({ example: 'Calle 100 #15-20' })
  address: string;

  @ApiProperty({ example: 'Bogotá' })
  city: string;
}

export class DriverInfoDto {
  @ApiProperty({ example: 'driver-uuid' })
  driverId: string;

  @ApiProperty({ example: 'Carlos Rodríguez' })
  driverName: string;

  @ApiPropertyOptional({ example: '+573001234567' })
  driverPhone?: string;

  @ApiPropertyOptional({ example: 'ABC-123' })
  vehiclePlate?: string;

  @ApiPropertyOptional({ example: 'Renault Logan 2020' })
  vehicleModel?: string;
}

export class RatingSnapshotDto {
  @ApiProperty({ example: '😍' })
  emoji: string;

  @ApiProperty({ example: 5 })
  score: number;

  @ApiPropertyOptional({ example: '¡Muy buen servicio!' })
  comment?: string;
}

export class TripHistoryEntryDto {
  @ApiProperty({ example: 'trip-uuid' })
  tripId: string;

  @ApiProperty({ example: 'PASSENGER', enum: ['DRIVER', 'PASSENGER'] })
  role: string;

  @ApiProperty({ example: 'COMPLETED' })
  status: string;

  @ApiProperty({ type: TripLocationSnapshotDto })
  origin: TripLocationSnapshotDto;

  @ApiProperty({ type: TripLocationSnapshotDto })
  destination: TripLocationSnapshotDto;

  @ApiProperty()
  departureAt: Date;

  @ApiPropertyOptional()
  arrivedAt?: Date;

  @ApiPropertyOptional({ example: 45 })
  durationMinutes?: number;

  @ApiProperty({ type: DriverInfoDto })
  driver: DriverInfoDto;

  @ApiProperty({ example: 1 })
  seatsReserved: number;

  @ApiProperty({ example: 8000 })
  pricePerSeat: number;

  @ApiProperty({ example: 8000 })
  totalPaid: number;

  @ApiProperty({ example: 3 })
  passengerCount: number;

  @ApiPropertyOptional({ type: RatingSnapshotDto })
  rating?: RatingSnapshotDto;

  @ApiPropertyOptional({ example: 'Salida puntual' })
  notes?: string;
}

export class TripHistoryPageDto {
  @ApiProperty({ type: [TripHistoryEntryDto] })
  entries: TripHistoryEntryDto[];

  @ApiProperty({ example: 15 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  pageSize: number;

  @ApiProperty({ example: 2 })
  totalPages: number;
}
