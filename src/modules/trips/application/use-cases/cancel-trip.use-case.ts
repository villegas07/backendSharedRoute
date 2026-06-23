import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { TripRepository } from '../../domain/repositories/trip.repository.interface';
import { TripResponseDto } from '../dtos/trip-response.dto';
import { TripMapper } from '../mappers/trip.mapper';

interface CancelTripInput {
  tripId: string;
  driverId: string;
}

@Injectable()
export class CancelTripUseCase {
  constructor(private readonly tripRepository: TripRepository) {}

  async execute({ tripId, driverId }: CancelTripInput): Promise<TripResponseDto> {
    const trip = await this.tripRepository.findById(tripId);
    if (!trip) throw new NotFoundException('Trip not found');
    if (trip.driverId !== driverId) throw new ForbiddenException('Trip does not belong to you');

    trip.cancel();
    const updated = await this.tripRepository.update(trip);
    return TripMapper.toResponse(updated);
  }
}
