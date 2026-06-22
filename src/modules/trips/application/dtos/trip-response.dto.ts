import { TripStatus } from '../../domain/entities/trip.entity';

export class TripResponseDto {
  id: string;
  driverId: string;
  vehicleId: string;
  originAddress: string;
  originCity: string;
  destinationAddress: string;
  destinationCity: string;
  departureAt: Date;
  availableSeats: number;
  pricePerSeat: number;
  status: TripStatus;
  notes?: string;
  createdAt: Date;
}
