import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { UseCase } from '../../../../application/use-cases/use-case.interface';
import { BookingEntity } from '../../domain/entities/booking.entity';
import { BookingRepository } from '../../domain/repositories/booking.repository.interface';
import { TripRepository } from '../../../trips/domain/repositories/trip.repository.interface';
import { CreateBookingDto } from '../dtos/create-booking.dto';
import { BookingResponseDto } from '../dtos/booking-response.dto';
import { BookingMapper } from '../mappers/booking.mapper';

interface CreateBookingInput {
  passengerId: string;
  dto: CreateBookingDto;
}

@Injectable()
export class CreateBookingUseCase implements UseCase<CreateBookingInput, BookingResponseDto> {
  constructor(
    private readonly bookingRepository: BookingRepository,
    private readonly tripRepository: TripRepository,
  ) {}

  async execute({ passengerId, dto }: CreateBookingInput): Promise<BookingResponseDto> {
    const trip = await this.tripRepository.findById(dto.tripId);
    if (!trip) throw new NotFoundException('Trip not found');

    await this.ensureNotAlreadyBooked(dto.tripId, passengerId);

    if (!trip.hasAvailableSeats()) {
      throw new ConflictException('No available seats on this trip');
    }

    const totalPrice = trip.pricePerSeat * dto.seatsReserved;
    trip.reserveSeat();

    const booking = BookingEntity.create({
      tripId: dto.tripId,
      passengerId,
      seatsReserved: dto.seatsReserved,
      totalPrice,
    });

    await this.tripRepository.update(trip);
    const saved = await this.bookingRepository.save(booking);
    return BookingMapper.toResponse(saved);
  }

  private async ensureNotAlreadyBooked(tripId: string, passengerId: string): Promise<void> {
    const existing = await this.bookingRepository.findByTripAndPassenger(tripId, passengerId);
    if (existing) throw new ConflictException('Already booked on this trip');
  }
}
