import { Injectable, NotFoundException } from '@nestjs/common';
import { TripRepository } from '../../domain/repositories/trip.repository.interface';
import { TripResponseDto } from '../dtos/trip-response.dto';
import { TripMapper } from '../mappers/trip.mapper';

@Injectable()
export class GetTripByIdUseCase {
  constructor(private readonly tripRepository: TripRepository) {}

  async execute(id: string): Promise<TripResponseDto> {
    const trip = await this.tripRepository.findById(id);
    if (!trip) throw new NotFoundException('Trip not found');
    return TripMapper.toResponse(trip);
  }
}
