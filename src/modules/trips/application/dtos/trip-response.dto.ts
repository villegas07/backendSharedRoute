import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TripStatus } from '../../domain/entities/trip.entity';

export class TripResponseDto {
  @ApiProperty({ example: 'uuid-v4' })
  id: string;

  @ApiProperty({ example: 'uuid-driver' })
  driverId: string;

  @ApiProperty({ example: 'uuid-vehicle' })
  vehicleId: string;

  @ApiProperty({ example: 'Cra 7 # 32-18, Bogotá' })
  originAddress: string;

  @ApiProperty({ example: 'Bogotá' })
  originCity: string;

  @ApiProperty({ example: 'Av. El Dorado # 103-23, Bogotá' })
  destinationAddress: string;

  @ApiProperty({ example: 'Bogotá' })
  destinationCity: string;

  @ApiProperty({ example: '2026-07-01T08:00:00.000Z' })
  departureAt: Date;

  @ApiProperty({ example: 3 })
  availableSeats: number;

  @ApiProperty({ example: 15000 })
  pricePerSeat: number;

  @ApiProperty({ enum: TripStatus })
  status: TripStatus;

  @ApiPropertyOptional({ example: 'No mascotas. Salida puntual.' })
  notes?: string;

  @ApiProperty()
  createdAt: Date;
}
