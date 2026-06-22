import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../shared/guards/jwt-auth.guard';
import { CurrentUser } from '../../../../shared/decorators/current-user.decorator';
import { CreateBookingUseCase } from '../../application/use-cases/create-booking.use-case';
import { CreateBookingDto } from '../../application/dtos/create-booking.dto';
import { BookingResponseDto } from '../../application/dtos/booking-response.dto';
import { BookingRepository } from '../../domain/repositories/booking.repository.interface';
import { BookingMapper } from '../../application/mappers/booking.mapper';

@ApiTags('bookings')
@ApiBearerAuth('access-token')
@Controller('bookings')
@UseGuards(JwtAuthGuard)
export class BookingsController {
  constructor(
    private readonly createBookingUseCase: CreateBookingUseCase,
    private readonly bookingRepository: BookingRepository,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Reservar asiento', description: 'El pasajero reserva asientos en un viaje publicado.' })
  @ApiResponse({ status: 201, description: 'Reserva creada.', type: BookingResponseDto })
  @ApiResponse({ status: 409, description: 'Ya tienes una reserva en este viaje o no hay asientos disponibles.' })
  create(
    @Body() dto: CreateBookingDto,
    @CurrentUser() user: { sub: string },
  ): Promise<BookingResponseDto> {
    return this.createBookingUseCase.execute({ passengerId: user.sub, dto });
  }

  @Get('my')
  @ApiOperation({ summary: 'Mis reservas', description: 'Retorna todas las reservas del pasajero autenticado.' })
  @ApiResponse({ status: 200, description: 'Lista de reservas.', type: [BookingResponseDto] })
  async findMyBookings(@CurrentUser() user: { sub: string }): Promise<BookingResponseDto[]> {
    const bookings = await this.bookingRepository.findByPassengerId(user.sub);
    return bookings.map((b) => BookingMapper.toResponse(b));
  }
}
