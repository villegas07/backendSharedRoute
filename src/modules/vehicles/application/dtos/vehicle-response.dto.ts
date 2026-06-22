import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VehicleStatus } from '../../domain/entities/vehicle.entity';

export class VehicleResponseDto {
  @ApiProperty({ example: 'uuid-v4' })
  id: string;

  @ApiProperty({ example: 'uuid-owner' })
  ownerId: string;

  @ApiProperty({ example: '2020 Toyota Corolla' })
  displayName: string;

  @ApiProperty({ example: 'Toyota' })
  brand: string;

  @ApiProperty({ example: 'Corolla' })
  model: string;

  @ApiProperty({ example: 2020 })
  year: number;

  @ApiProperty({ example: 'ABC-123' })
  plate: string;

  @ApiProperty({ example: 'Blanco' })
  color: string;

  @ApiProperty({ example: 4 })
  totalSeats: number;

  @ApiProperty({ enum: VehicleStatus })
  status: VehicleStatus;

  @ApiPropertyOptional({ example: 'https://cdn.sharedroute.app/vehicles/foto.jpg' })
  photoUrl?: string;

  @ApiProperty()
  createdAt: Date;
}
