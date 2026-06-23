import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../shared/guards/jwt-auth.guard';
import { SubmitReviewUseCase } from '../../application/use-cases/submit-review.use-case';
import { GetUserRatingUseCase } from '../../application/use-cases/get-user-rating.use-case';
import { GetTripReviewsUseCase } from '../../application/use-cases/get-trip-reviews.use-case';
import { SubmitReviewDto } from '../../application/dtos/submit-review.dto';
import { ReviewerRole } from '../../domain/enums/reviewer-role.enum';

@ApiTags('reviews')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('reviews')
export class ReviewsController {
  constructor(
    private readonly submitReviewUseCase: SubmitReviewUseCase,
    private readonly getUserRatingUseCase: GetUserRatingUseCase,
    private readonly getTripReviewsUseCase: GetTripReviewsUseCase,
  ) {}

  @Post('trips/:tripId/driver')
  @ApiOperation({
    summary: 'Pasajero califica al conductor',
    description: 'Solo disponible cuando el viaje está COMPLETADO. Una calificación por viaje.',
  })
  @ApiResponse({ status: 201, description: 'Calificación enviada' })
  async rateDriver(
    @Param('tripId') tripId: string,
    @Body() dto: SubmitReviewDto,
    @Req() req: { user?: { id?: string } },
  ) {
    return this.submitReviewUseCase.execute({
      tripId,
      reviewerId: req.user?.id ?? '',
      reviewerRole: ReviewerRole.PASSENGER,
      reviewedUserId: '',
      ...dto,
    });
  }

  @Post('trips/:tripId/passenger/:passengerId')
  @ApiOperation({
    summary: 'Conductor califica a un pasajero',
    description: 'Solo disponible cuando el viaje está COMPLETADO. Una calificación por pasajero por viaje.',
  })
  @ApiResponse({ status: 201, description: 'Calificación enviada' })
  async ratePassenger(
    @Param('tripId') tripId: string,
    @Param('passengerId') passengerId: string,
    @Body() dto: SubmitReviewDto,
    @Req() req: { user?: { id?: string } },
  ) {
    return this.submitReviewUseCase.execute({
      tripId,
      reviewerId: req.user?.id ?? '',
      reviewerRole: ReviewerRole.DRIVER,
      reviewedUserId: passengerId,
      ...dto,
    });
  }

  @Get('trips/:tripId')
  @ApiOperation({ summary: 'Ver calificaciones de un viaje' })
  async getTripReviews(@Param('tripId') tripId: string) {
    return this.getTripReviewsUseCase.execute(tripId);
  }

  @Get('users/:userId')
  @ApiOperation({
    summary: 'Ver perfil de calificaciones de un usuario',
    description: 'Promedio, emoji dominante y desglose por tipo de calificación.',
  })
  async getUserRating(@Param('userId') userId: string) {
    return this.getUserRatingUseCase.execute(userId);
  }
}
