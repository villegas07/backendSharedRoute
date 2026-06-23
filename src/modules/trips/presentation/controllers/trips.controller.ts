import {
  Body, Controller, Delete, Get, HttpCode, HttpStatus,
  Param, Patch, Post, Query, UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../shared/guards/jwt-auth.guard';
import { HasActiveSubscriptionGuard } from '../../../../shared/guards/has-active-subscription.guard';
import { CurrentUser } from '../../../../shared/decorators/current-user.decorator';
import { PublishTripUseCase } from '../../application/use-cases/publish-trip.use-case';
import { GetTripByIdUseCase } from '../../application/use-cases/get-trip-by-id.use-case';
import { GetMyTripsUseCase } from '../../application/use-cases/get-my-trips.use-case';
import { UpdateTripUseCase } from '../../application/use-cases/update-trip.use-case';
import { CancelTripUseCase } from '../../application/use-cases/cancel-trip.use-case';
import { PublishTripDto } from '../../application/dtos/publish-trip.dto';
import { UpdateTripDto } from '../../application/dtos/update-trip.dto';
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
    private readonly getTripByIdUseCase: GetTripByIdUseCase,
    private readonly getMyTripsUseCase: GetMyTripsUseCase,
    private readonly updateTripUseCase: UpdateTripUseCase,
    private readonly cancelTripUseCase: CancelTripUseCase,
    private readonly tripRepository: TripRepository,
  ) {}

  @Post()
  @UseGuards(HasActiveSubscriptionGuard)
  @ApiOperation({ summary: 'Publicar viaje', description: 'Requiere suscripción activa.' })
  @ApiResponse({ status: 201, type: TripResponseDto })
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

  @Get('my')
  @ApiOperation({ summary: 'Mis viajes publicados (conductor)' })
  @ApiResponse({ status: 200, type: [TripResponseDto] })
  findMyTrips(@CurrentUser() user: { sub: string }): Promise<TripResponseDto[]> {
    return this.getMyTripsUseCase.execute(user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener viaje por ID' })
  @ApiResponse({ status: 200, type: TripResponseDto })
  @ApiResponse({ status: 404, description: 'Viaje no encontrado.' })
  findById(@Param('id') id: string): Promise<TripResponseDto> {
    return this.getTripByIdUseCase.execute(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar viaje (solo DRAFT o PUBLISHED)' })
  @ApiResponse({ status: 200, type: TripResponseDto })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTripDto,
    @CurrentUser() user: { sub: string },
  ): Promise<TripResponseDto> {
    return this.updateTripUseCase.execute({ tripId: id, driverId: user.sub, dto });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancelar viaje' })
  @ApiResponse({ status: 200, type: TripResponseDto })
  cancel(
    @Param('id') id: string,
    @CurrentUser() user: { sub: string },
  ): Promise<TripResponseDto> {
    return this.cancelTripUseCase.execute({ tripId: id, driverId: user.sub });
  }
}


