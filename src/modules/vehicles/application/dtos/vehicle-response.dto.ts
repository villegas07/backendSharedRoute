import { VehicleStatus } from '../../domain/entities/vehicle.entity';

export class VehicleResponseDto {
  id: string;
  ownerId: string;
  displayName: string;
  brand: string;
  model: string;
  year: number;
  plate: string;
  color: string;
  totalSeats: number;
  status: VehicleStatus;
  photoUrl?: string;
  createdAt: Date;
}
