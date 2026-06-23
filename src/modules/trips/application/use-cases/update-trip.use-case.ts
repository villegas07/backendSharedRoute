import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { TripRepository } from '../../domain/repositories/trip.repository.interface';
import { UpdateTripDto } from '../dtos/update-trip.dto';
import { TripResponseDto } from '../dtos/trip-response.dto';
import { TripMapper } from '../mappers/trip.mapper';
import { TripStatus } from '../../domain/entities/trip.entity';
import { LocationValueObject } from '../../domain/value-objects/location.vo';

interface UpdateTripInput {
  tripId: string;
  driverId: string;
  dto: UpdateTripDto;
}

@Injectable()
export class UpdateTripUseCase {
  constructor(private readonly tripRepository: TripRepository) {}

  async execute({ tripId, driverId, dto }: UpdateTripInput): Promise<TripResponseDto> {
    const trip = await this.tripRepository.findById(tripId);
    if (!trip) throw new NotFoundException('Trip not found');
    if (trip.driverId !== driverId) throw new ForbiddenException('Trip does not belong to you');
    if (trip.status !== TripStatus.DRAFT && trip.status !== TripStatus.PUBLISHED) {
      throw new BadRequestException('Only DRAFT or PUBLISHED trips can be updated');
    }

    if (this.hasOriginUpdate(dto)) {
      trip.origin = LocationValueObject.create({
        address: dto.originAddress ?? trip.origin.address,
        city: dto.originCity ?? trip.origin.city,
        latitude: dto.originLatitude ?? trip.origin.latitude,
        longitude: dto.originLongitude ?? trip.origin.longitude,
      });
    }

    if (this.hasDestinationUpdate(dto)) {
      trip.destination = LocationValueObject.create({
        address: dto.destinationAddress ?? trip.destination.address,
        city: dto.destinationCity ?? trip.destination.city,
        latitude: dto.destinationLatitude ?? trip.destination.latitude,
        longitude: dto.destinationLongitude ?? trip.destination.longitude,
      });
    }

    if (dto.departureAt) trip.departureAt = dto.departureAt;
    if (dto.availableSeats) trip.availableSeats = dto.availableSeats;
    if (dto.pricePerSeat !== undefined) trip.pricePerSeat = dto.pricePerSeat;
    if (dto.notes !== undefined) trip.notes = dto.notes;
    trip.touch();

    const updated = await this.tripRepository.update(trip);
    return TripMapper.toResponse(updated);
  }

  private hasOriginUpdate(dto: UpdateTripDto): boolean {
    return !!(dto.originAddress || dto.originCity || dto.originLatitude !== undefined || dto.originLongitude !== undefined);
  }

  private hasDestinationUpdate(dto: UpdateTripDto): boolean {
    return !!(dto.destinationAddress || dto.destinationCity || dto.destinationLatitude !== undefined || dto.destinationLongitude !== undefined);
  }
}
