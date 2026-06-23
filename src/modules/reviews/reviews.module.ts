import { Module } from '@nestjs/common';
import { ReviewRepository } from './domain/ports/review.repository';
import { TripReviewPort } from './domain/ports/trip-review.port';
import { InMemoryReviewStore } from './infrastructure/stores/in-memory-review.store';
import { StubTripReviewAdapter } from './infrastructure/adapters/stub-trip-review.adapter';
import { SubmitReviewUseCase } from './application/use-cases/submit-review.use-case';
import { GetUserRatingUseCase } from './application/use-cases/get-user-rating.use-case';
import { GetTripReviewsUseCase } from './application/use-cases/get-trip-reviews.use-case';
import { ReviewsController } from './presentation/controllers/reviews.controller';

@Module({
  controllers: [ReviewsController],
  providers: [
    { provide: ReviewRepository, useClass: InMemoryReviewStore },
    { provide: TripReviewPort, useClass: StubTripReviewAdapter },
    SubmitReviewUseCase,
    GetUserRatingUseCase,
    GetTripReviewsUseCase,
  ],
  exports: [ReviewRepository],
})
export class ReviewsModule {}
