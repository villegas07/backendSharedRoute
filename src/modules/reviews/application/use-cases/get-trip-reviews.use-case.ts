import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../../application/use-cases/use-case.interface';
import { ReviewRepository } from '../../domain/ports/review.repository';
import { ReviewEntity } from '../../domain/entities/review.entity';

@Injectable()
export class GetTripReviewsUseCase
  implements UseCase<string, ReviewEntity[]>
{
  constructor(private readonly reviewRepo: ReviewRepository) {}

  async execute(tripId: string): Promise<ReviewEntity[]> {
    return this.reviewRepo.findByTripId(tripId);
  }
}
