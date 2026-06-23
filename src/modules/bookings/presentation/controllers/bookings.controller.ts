import {
  Body, Controller, Get, HttpCode, HttpStatus,
  Param, Patch, Post, UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../shared/guards/jwt-auth.guard';
import { CurrentUser } from '../../../../shared/decorators/current-user.decorator';
import { CreateBookingUseCase } from '../../application/use-cases/create-booking.use-case';
import { GetBookingByIdUseCase } from '../../application/use-cases/get-booking-by-id.use-case';
import { CancelBookingUseCase } from '../../application/use-cases/cancel-booking.use-case';
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
    private readonly getBookingByIdUseCase: GetBookingByIdUseCase,
    private readonly cancelBookingUseCase: CancelBookingUseCase,
    private readonly bookingRepository: BookingRepository,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Reservar asiento', description: 'El pasajero reserva asientos en un viaje.' })
  @ApiResponse({ status: 201, type: BookingResponseDto })
  @ApiResponse({ status: 409, description: 'Ya tienes una reserva o no hay asientos.' })
  create(
    @Body() dto: CreateBookingDto,
    @CurrentUser() user: { sub: string },
  ): Promise<BookingResponseDto> {
    return this.createBookingUseCase.execute({ passengerId: user.sub, dto });
  }

  @Get('my')
  @ApiOperation({ summary: 'Mis reservas' })
  @ApiResponse({ status: 200, type: [BookingResponseDto] })
  async findMyBookings(
    @CurrentUser() user: { sub: string },
  ): Promise<BookingResponseDto[]> {
    const bookings = await this.bookingRepository.findByPassengerId(user.sub);
    return bookings.map((b) => BookingMapper.toResponse(b));
  }

  @Get(':id')
  @ApiParam({ name: 'id', description: 'UUID de la reserva', type: 'string' })
  @ApiOperation({ summary: 'Obtener reserva por ID' })
  @ApiResponse({ status: 200, type: BookingResponseDto })
  @ApiResponse({ status: 404, description: 'Reserva no encontrada.' })
  findById(@Param('id') id: string): Promise<BookingResponseDto> {
    return this.getBookingByIdUseCase.execute(id);
  }

  @Patch(':id/cancel')
  @ApiParam({ name: 'id', description: 'UUID de la reserva', type: 'string' })
  @ApiOperation({ summary: 'Cancelar reserva (pasajero)' })
  @ApiResponse({ status: 200, type: BookingResponseDto })
  @ApiResponse({ status: 403, description: 'La reserva no te pertenece.' })
  cancelByPassenger(
    @Param('id') id: string,
    @CurrentUser() user: { sub: string },
  ): Promise<BookingResponseDto> {
    return this.cancelBookingUseCase.execute({
      bookingId: id,
      requesterId: user.sub,
      byDriver: false,
    });
  }

  @Patch(':id/cancel-by-driver')
  @ApiParam({ name: 'id', description: 'UUID de la reserva', type: 'string' })
  @ApiOperation({ summary: 'Cancelar reserva (conductor)' })
  @ApiResponse({ status: 200, type: BookingResponseDto })
  cancelByDriver(
    @Param('id') id: string,
    @CurrentUser() user: { sub: string },
  ): Promise<BookingResponseDto> {
    return this.cancelBookingUseCase.execute({
      bookingId: id,
      requesterId: user.sub,
      byDriver: true,
    });
  }
}

