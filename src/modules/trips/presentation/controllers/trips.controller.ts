import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../shared/guards/jwt-auth.guard';
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
  @ApiOperation({ summary: 'Publicar viaje', description: 'El conductor publica un nuevo viaje disponible.' })
  @ApiResponse({ status: 201, description: 'Viaje publicado.', type: TripResponseDto })
  publish(
    @Body() dto: PublishTripDto,
    @CurrentUser() user: { sub: string },
  ): Promise<TripResponseDto> {
    return this.publishTripUseCase.execute({ driverId: user.sub, dto });
  }

  @Get()
  @ApiOperation({ summary: 'Buscar viajes disponibles', description: 'Filtra viajes publicados por ciudad, fecha y asientos.' })
  @ApiResponse({ status: 200, description: 'Lista de viajes disponibles.', type: [TripResponseDto] })
  async findAvailable(@Query() filters: SearchTripsDto): Promise<TripResponseDto[]> {
    const trips = await this.tripRepository.findAvailable(filters);
    return TripMapper.toResponseList(trips);
  }
}

