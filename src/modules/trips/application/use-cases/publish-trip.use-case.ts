import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../../application/use-cases/use-case.interface';
import { LocationValueObject } from '../../domain/value-objects/location.vo';
import { TripEntity } from '../../domain/entities/trip.entity';
import { TripRepository } from '../../domain/repositories/trip.repository.interface';
import { PublishTripDto } from '../dtos/publish-trip.dto';
import { TripResponseDto } from '../dtos/trip-response.dto';
import { TripMapper } from '../mappers/trip.mapper';

interface PublishTripInput {
  driverId: string;
  dto: PublishTripDto;
}

@Injectable()
export class PublishTripUseCase implements UseCase<PublishTripInput, TripResponseDto> {
  constructor(private readonly tripRepository: TripRepository) {}

  async execute({ driverId, dto }: PublishTripInput): Promise<TripResponseDto> {
    const origin = LocationValueObject.create({
      latitude: dto.originLatitude,
      longitude: dto.originLongitude,
      address: dto.originAddress,
      city: dto.originCity,
    });

    const destination = LocationValueObject.create({
      latitude: dto.destinationLatitude,
      longitude: dto.destinationLongitude,
      address: dto.destinationAddress,
      city: dto.destinationCity,
    });

    const trip = TripEntity.create({
      driverId,
      vehicleId: dto.vehicleId,
      origin,
      destination,
      departureAt: dto.departureAt,
      availableSeats: dto.availableSeats,
      pricePerSeat: dto.pricePerSeat,
      notes: dto.notes,
    });

    trip.publish();
    const saved = await this.tripRepository.save(trip);
    return TripMapper.toResponse(saved);
  }
}
