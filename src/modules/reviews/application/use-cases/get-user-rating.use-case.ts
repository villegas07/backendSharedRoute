import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../../application/use-cases/use-case.interface';
import { ReviewRepository, UserRatingSummary } from '../../domain/ports/review.repository';

@Injectable()
export class GetUserRatingUseCase
  implements UseCase<string, UserRatingSummary>
{
  constructor(private readonly reviewRepo: ReviewRepository) {}

  async execute(userId: string): Promise<UserRatingSummary> {
    return this.reviewRepo.getRatingSummary(userId);
  }
}
