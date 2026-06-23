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
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../shared/guards/jwt-auth.guard';
import { SubmitReviewUseCase } from '../../application/use-cases/submit-review.use-case';
import { GetUserRatingUseCase } from '../../application/use-cases/get-user-rating.use-case';
import { GetTripReviewsUseCase } from '../../application/use-cases/get-trip-reviews.use-case';
import { SubmitReviewDto } from '../../application/dtos/submit-review.dto';
import { ReviewerRole } from '../../domain/enums/reviewer-role.enum';
import { ReviewResponseDto, UserRatingSummaryResponseDto } from '../../application/dtos/review-response.dto';

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
  @ApiParam({ name: 'tripId', description: 'UUID del viaje', type: 'string' })
  @ApiOperation({
    summary: 'Pasajero califica al conductor',
    description: 'Solo disponible cuando el viaje está COMPLETADO. Una calificación por viaje por usuario.',
  })
  @ApiResponse({ status: 201, type: ReviewResponseDto, description: 'Calificación enviada' })
  @ApiResponse({ status: 400, description: 'El viaje no está completado.' })
  @ApiResponse({ status: 403, description: 'No participaste en este viaje.' })
  @ApiResponse({ status: 409, description: 'Ya enviaste una calificación para este viaje.' })
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
  @ApiParam({ name: 'tripId', description: 'UUID del viaje', type: 'string' })
  @ApiParam({ name: 'passengerId', description: 'UUID del pasajero a calificar', type: 'string' })
  @ApiOperation({
    summary: 'Conductor califica a un pasajero',
    description: 'Solo disponible cuando el viaje está COMPLETADO.',
  })
  @ApiResponse({ status: 201, type: ReviewResponseDto, description: 'Calificación enviada' })
  @ApiResponse({ status: 400, description: 'El viaje no está completado.' })
  @ApiResponse({ status: 409, description: 'Ya calificaste a este pasajero en este viaje.' })
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
  @ApiParam({ name: 'tripId', description: 'UUID del viaje', type: 'string' })
  @ApiOperation({ summary: 'Ver calificaciones de un viaje' })
  @ApiResponse({ status: 200, type: [ReviewResponseDto] })
  async getTripReviews(@Param('tripId') tripId: string) {
    return this.getTripReviewsUseCase.execute(tripId);
  }

  @Get('users/:userId')
  @ApiParam({ name: 'userId', description: 'UUID del usuario', type: 'string' })
  @ApiOperation({
    summary: 'Ver perfil de calificaciones de un usuario',
    description: 'Devuelve promedio numérico, emoji dominante y desglose por tipo de rating.',
  })
  @ApiResponse({ status: 200, type: UserRatingSummaryResponseDto })
  async getUserRating(@Param('userId') userId: string) {
    return this.getUserRatingUseCase.execute(userId);
  }
}
