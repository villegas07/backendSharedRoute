import { Injectable, NotFoundException } from '@nestjs/common';
import { BookingRepository } from '../../domain/repositories/booking.repository.interface';
import { BookingResponseDto } from '../dtos/booking-response.dto';
import { BookingMapper } from '../mappers/booking.mapper';

@Injectable()
export class GetBookingByIdUseCase {
  constructor(private readonly bookingRepository: BookingRepository) {}

  async execute(id: string): Promise<BookingResponseDto> {
    const booking = await this.bookingRepository.findById(id);
    if (!booking) throw new NotFoundException('Booking not found');
    return BookingMapper.toResponse(booking);
  }
}
