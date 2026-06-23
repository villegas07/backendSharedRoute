import { InMemoryReviewStore } from '@/modules/reviews/infrastructure/stores/in-memory-review.store';
import { ReviewEntity } from '@/modules/reviews/domain/entities/review.entity';
import { EmojiRating } from '@/modules/reviews/domain/enums/emoji-rating.enum';
import { ReviewerRole } from '@/modules/reviews/domain/enums/reviewer-role.enum';

const makeReview = (
  tripId = 'trip-1',
  reviewerId = 'pass-1',
  reviewedUserId = 'driver-1',
  rating = EmojiRating.EXCELLENT,
) =>
  ReviewEntity.create({
    tripId,
    reviewerId,
    reviewerRole: ReviewerRole.PASSENGER,
    reviewedUserId,
    rating,
  });

describe('InMemoryReviewStore', () => {
  let store: InMemoryReviewStore;

  beforeEach(() => {
    store = new InMemoryReviewStore();
  });

  describe('save / findById', () => {
    it('should save and find a review by id', async () => {
      const review = makeReview();
      await store.save(review);
      expect(await store.findById(review.id)).toBe(review);
    });

    it('should return null for unknown id', async () => {
      expect(await store.findById('x')).toBeNull();
    });
  });

  describe('findByTripId', () => {
    it('should return all reviews for a trip', async () => {
      await store.save(makeReview('trip-1', 'pass-1', 'driver-1'));
      await store.save(makeReview('trip-1', 'driver-1', 'pass-1'));
      await store.save(makeReview('trip-2', 'pass-2', 'driver-2'));

      const results = await store.findByTripId('trip-1');
      expect(results).toHaveLength(2);
    });

    it('should return empty array for trip with no reviews', async () => {
      expect(await store.findByTripId('no-reviews')).toEqual([]);
    });
  });

  describe('findByReviewedUserId', () => {
    it('should return reviews where user is the reviewed party', async () => {
      await store.save(makeReview('trip-1', 'pass-1', 'driver-1', EmojiRating.EXCELLENT));
      await store.save(makeReview('trip-2', 'pass-2', 'driver-1', EmojiRating.GOOD));
      await store.save(makeReview('trip-3', 'driver-1', 'pass-1', EmojiRating.BAD));

      const results = await store.findByReviewedUserId('driver-1');
      expect(results).toHaveLength(2);
      expect(results.every((r) => r.reviewedUserId === 'driver-1')).toBe(true);
    });
  });

  describe('existsByTripAndReviewer', () => {
    it('should return true if reviewer already rated in this trip', async () => {
      await store.save(makeReview('trip-1', 'pass-1', 'driver-1'));

      expect(
        await store.existsByTripAndReviewer('trip-1', 'pass-1'),
      ).toBe(true);
    });

    it('should return false if reviewer has not rated in this trip', async () => {
      expect(
        await store.existsByTripAndReviewer('trip-1', 'pass-1'),
      ).toBe(false);
    });

    it('should return false for a different trip', async () => {
      await store.save(makeReview('trip-1', 'pass-1', 'driver-1'));
      expect(
        await store.existsByTripAndReviewer('trip-2', 'pass-1'),
      ).toBe(false);
    });
  });

  describe('getRatingSummary', () => {
    it('should compute correct summary from saved reviews', async () => {
      await store.save(makeReview('trip-1', 'pass-1', 'driver-1', EmojiRating.EXCELLENT));
      await store.save(makeReview('trip-2', 'pass-2', 'driver-1', EmojiRating.GOOD));
      await store.save(makeReview('trip-3', 'pass-3', 'driver-1', EmojiRating.GOOD));
      await store.save(makeReview('trip-4', 'pass-4', 'driver-1', EmojiRating.BAD));

      const summary = await store.getRatingSummary('driver-1');

      expect(summary.totalReviews).toBe(4);
      expect(summary.averageScore).toBeCloseTo((5 + 4 + 4 + 1) / 4, 2);
      expect(summary.ratingBreakdown[EmojiRating.GOOD]).toBe(2);
      expect(summary.ratingBreakdown[EmojiRating.EXCELLENT]).toBe(1);
      expect(summary.ratingBreakdown[EmojiRating.BAD]).toBe(1);
      expect(summary.dominantEmoji).toBe('😊');
    });

    it('should return zero summary for user with no reviews', async () => {
      const summary = await store.getRatingSummary('no-reviews');

      expect(summary.totalReviews).toBe(0);
      expect(summary.averageScore).toBe(0);
      expect(summary.dominantEmoji).toBe('');
    });
  });
});
