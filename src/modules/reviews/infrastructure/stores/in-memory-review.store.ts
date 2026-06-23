import { Injectable } from '@nestjs/common';
import {
  ReviewRepository,
  UserRatingSummary,
} from '../../domain/ports/review.repository';
import { ReviewEntity } from '../../domain/entities/review.entity';
import {
  EmojiRating,
  EMOJI_DISPLAY,
  EMOJI_SCORE,
} from '../../domain/enums/emoji-rating.enum';

@Injectable()
export class InMemoryReviewStore extends ReviewRepository {
  private readonly reviews: ReviewEntity[] = [];

  async save(review: ReviewEntity): Promise<void> {
    this.reviews.push(review);
  }

  async findById(id: string): Promise<ReviewEntity | null> {
    return this.reviews.find((r) => r.id === id) ?? null;
  }

  async findByTripId(tripId: string): Promise<ReviewEntity[]> {
    return this.reviews.filter((r) => r.tripId === tripId);
  }

  async findByReviewedUserId(userId: string): Promise<ReviewEntity[]> {
    return this.reviews.filter((r) => r.reviewedUserId === userId);
  }

  async existsByTripAndReviewer(
    tripId: string,
    reviewerId: string,
  ): Promise<boolean> {
    return this.reviews.some(
      (r) => r.tripId === tripId && r.reviewerId === reviewerId,
    );
  }

  async getRatingSummary(userId: string): Promise<UserRatingSummary> {
    const userReviews = this.reviews.filter(
      (r) => r.reviewedUserId === userId,
    );

    const breakdown = this.buildBreakdown(userReviews);
    const totalReviews = userReviews.length;
    const averageScore = this.computeAverage(userReviews, totalReviews);
    const dominantEmoji = this.findDominantEmoji(breakdown, totalReviews);

    return { userId, totalReviews, averageScore, dominantEmoji, ratingBreakdown: breakdown };
  }

  private buildBreakdown(
    reviews: ReviewEntity[],
  ): Record<string, number> {
    const breakdown: Record<string, number> = {
      [EmojiRating.EXCELLENT]: 0,
      [EmojiRating.GOOD]: 0,
      [EmojiRating.NEUTRAL]: 0,
      [EmojiRating.POOR]: 0,
      [EmojiRating.BAD]: 0,
    };
    for (const review of reviews) {
      breakdown[review.rating] += 1;
    }
    return breakdown;
  }

  private computeAverage(reviews: ReviewEntity[], total: number): number {
    if (total === 0) return 0;
    const sum = reviews.reduce((acc, r) => acc + EMOJI_SCORE[r.rating], 0);
    return Math.round((sum / total) * 100) / 100;
  }

  private findDominantEmoji(
    breakdown: Record<string, number>,
    total: number,
  ): string {
    if (total === 0) return '';
    const dominant = Object.entries(breakdown).sort(
      ([, a], [, b]) => b - a,
    )[0][0] as EmojiRating;
    return EMOJI_DISPLAY[dominant];
  }
}
