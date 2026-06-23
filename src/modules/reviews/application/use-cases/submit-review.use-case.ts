import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { UseCase } from '../../../../application/use-cases/use-case.interface';
import { ReviewRepository } from '../../domain/ports/review.repository';
import { TripReviewPort } from '../../domain/ports/trip-review.port';
import { ReviewEntity } from '../../domain/entities/review.entity';
import { EmojiRating } from '../../domain/enums/emoji-rating.enum';
import { ReviewerRole } from '../../domain/enums/reviewer-role.enum';

export interface SubmitReviewInput {
  tripId: string;
  reviewerId: string;
  reviewerRole: ReviewerRole;
  reviewedUserId: string;
  rating: EmojiRating;
  comment?: string;
}

@Injectable()
export class SubmitReviewUseCase
  implements UseCase<SubmitReviewInput, ReviewEntity>
{
  constructor(
    private readonly reviewRepo: ReviewRepository,
    private readonly tripPort: TripReviewPort,
  ) {}

  async execute(input: SubmitReviewInput): Promise<ReviewEntity> {
    const trip = await this.tripPort.getTripParticipants(input.tripId);
    if (!trip) {
      throw new NotFoundException('Viaje no encontrado');
    }
    if (!trip.isCompleted) {
      throw new BadRequestException(
        'Solo puedes calificar después de que el viaje haya sido completado',
      );
    }

    const allParticipants = [trip.driverId, ...trip.passengerIds];
    if (!allParticipants.includes(input.reviewerId)) {
      throw new ForbiddenException(
        'No participaste en este viaje, no puedes calificarlo',
      );
    }

    const alreadyReviewed = await this.reviewRepo.existsByTripAndReviewer(
      input.tripId,
      input.reviewerId,
    );
    if (alreadyReviewed) {
      throw new ConflictException('Ya enviaste una calificación para este viaje');
    }

    const review = ReviewEntity.create(input);
    await this.reviewRepo.save(review);
    return review;
  }
}
