import { Injectable } from '@nestjs/common';
import { TripRepository } from '../../domain/repositories/trip.repository.interface';
import { TripResponseDto } from '../dtos/trip-response.dto';
import { TripMapper } from '../mappers/trip.mapper';

@Injectable()
export class GetMyTripsUseCase {
  constructor(private readonly tripRepository: TripRepository) {}

  async execute(driverId: string): Promise<TripResponseDto[]> {
    const trips = await this.tripRepository.findByDriverId(driverId);
    return TripMapper.toResponseList(trips);
  }
}
