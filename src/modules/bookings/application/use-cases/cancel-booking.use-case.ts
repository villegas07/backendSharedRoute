import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { BookingRepository } from '../../domain/repositories/booking.repository.interface';
import { BookingResponseDto } from '../dtos/booking-response.dto';
import { BookingMapper } from '../mappers/booking.mapper';

interface CancelBookingInput {
  bookingId: string;
  requesterId: string;
  byDriver: boolean;
}

@Injectable()
export class CancelBookingUseCase {
  constructor(private readonly bookingRepository: BookingRepository) {}

  async execute({ bookingId, requesterId, byDriver }: CancelBookingInput): Promise<BookingResponseDto> {
    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking) throw new NotFoundException('Booking not found');

    if (!byDriver && booking.passengerId !== requesterId) {
      throw new ForbiddenException('Booking does not belong to you');
    }

    if (byDriver) {
      booking.cancelByDriver();
    } else {
      booking.cancelByPassenger();
    }

    const updated = await this.bookingRepository.update(booking);
    return BookingMapper.toResponse(updated);
  }
}
