import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../../shared/guards/jwt-auth.guard';
import { CurrentUser } from '../../../../shared/decorators/current-user.decorator';
import { CreateBookingUseCase } from '../../application/use-cases/create-booking.use-case';
import { CreateBookingDto } from '../../application/dtos/create-booking.dto';
import { BookingResponseDto } from '../../application/dtos/booking-response.dto';
import { BookingRepository } from '../../domain/repositories/booking.repository.interface';
import { BookingMapper } from '../../application/mappers/booking.mapper';

@Controller('bookings')
@UseGuards(JwtAuthGuard)
export class BookingsController {
  constructor(
    private readonly createBookingUseCase: CreateBookingUseCase,
    private readonly bookingRepository: BookingRepository,
  ) {}

  @Post()
  create(
    @Body() dto: CreateBookingDto,
    @CurrentUser() user: { sub: string },
  ): Promise<BookingResponseDto> {
    return this.createBookingUseCase.execute({ passengerId: user.sub, dto });
  }

  @Get('my')
  async findMyBookings(@CurrentUser() user: { sub: string }): Promise<BookingResponseDto[]> {
    const bookings = await this.bookingRepository.findByPassengerId(user.sub);
    return bookings.map((b) => BookingMapper.toResponse(b));
  }
}
