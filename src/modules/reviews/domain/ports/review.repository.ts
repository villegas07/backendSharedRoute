import { ReviewEntity } from '../entities/review.entity';

export interface UserRatingSummary {
  userId: string;
  totalReviews: number;
  averageScore: number;
  dominantEmoji: string;
  ratingBreakdown: Record<string, number>;
}

export abstract class ReviewRepository {
  abstract save(review: ReviewEntity): Promise<void>;
  abstract findById(id: string): Promise<ReviewEntity | null>;
  abstract findByTripId(tripId: string): Promise<ReviewEntity[]>;
  abstract findByReviewedUserId(userId: string): Promise<ReviewEntity[]>;
  abstract existsByTripAndReviewer(
    tripId: string,
    reviewerId: string,
  ): Promise<boolean>;
  abstract getRatingSummary(userId: string): Promise<UserRatingSummary>;
}
