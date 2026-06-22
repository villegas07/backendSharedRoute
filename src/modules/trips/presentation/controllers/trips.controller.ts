import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../../shared/guards/jwt-auth.guard';
import { CurrentUser } from '../../../../shared/decorators/current-user.decorator';
import { PublishTripUseCase } from '../../application/use-cases/publish-trip.use-case';
import { PublishTripDto } from '../../application/dtos/publish-trip.dto';
import { SearchTripsDto } from '../../application/dtos/search-trips.dto';
import { TripResponseDto } from '../../application/dtos/trip-response.dto';
import { TripRepository } from '../../domain/repositories/trip.repository.interface';
import { TripMapper } from '../../application/mappers/trip.mapper';

@Controller('trips')
@UseGuards(JwtAuthGuard)
export class TripsController {
  constructor(
    private readonly publishTripUseCase: PublishTripUseCase,
    private readonly tripRepository: TripRepository,
  ) {}

  @Post()
  publish(
    @Body() dto: PublishTripDto,
    @CurrentUser() user: { sub: string },
  ): Promise<TripResponseDto> {
    return this.publishTripUseCase.execute({ driverId: user.sub, dto });
  }

  @Get()
  async findAvailable(@Query() filters: SearchTripsDto): Promise<TripResponseDto[]> {
    const trips = await this.tripRepository.findAvailable(filters);
    return TripMapper.toResponseList(trips);
  }
}

