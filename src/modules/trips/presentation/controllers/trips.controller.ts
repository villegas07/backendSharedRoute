import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../shared/guards/jwt-auth.guard';
import { HasActiveSubscriptionGuard } from '../../../../shared/guards/has-active-subscription.guard';
import { CurrentUser } from '../../../../shared/decorators/current-user.decorator';
import { PublishTripUseCase } from '../../application/use-cases/publish-trip.use-case';
import { PublishTripDto } from '../../application/dtos/publish-trip.dto';
import { SearchTripsDto } from '../../application/dtos/search-trips.dto';
import { TripResponseDto } from '../../application/dtos/trip-response.dto';
import { TripRepository } from '../../domain/repositories/trip.repository.interface';
import { TripMapper } from '../../application/mappers/trip.mapper';

@ApiTags('trips')
@ApiBearerAuth('access-token')
@Controller('trips')
@UseGuards(JwtAuthGuard)
export class TripsController {
  constructor(
    private readonly publishTripUseCase: PublishTripUseCase,
    private readonly tripRepository: TripRepository,
  ) {}

  @Post()
  @UseGuards(HasActiveSubscriptionGuard)
  @ApiOperation({
    summary: 'Publicar viaje',
    description: 'Requiere suscripción activa. El conductor publica un nuevo viaje.',
  })
  @ApiResponse({ status: 201, description: 'Viaje publicado.', type: TripResponseDto })
  @ApiResponse({ status: 403, description: 'Sin suscripción activa.' })
  publish(
    @Body() dto: PublishTripDto,
    @CurrentUser() user: { sub: string },
  ): Promise<TripResponseDto> {
    return this.publishTripUseCase.execute({ driverId: user.sub, dto });
  }

  @Get()
  @ApiOperation({ summary: 'Buscar viajes disponibles' })
  @ApiResponse({ status: 200, type: [TripResponseDto] })
  async findAvailable(@Query() filters: SearchTripsDto): Promise<TripResponseDto[]> {
    const trips = await this.tripRepository.findAvailable(filters);
    return TripMapper.toResponseList(trips);
  }
}

