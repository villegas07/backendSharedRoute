import { ReviewEntity } from '@/modules/reviews/domain/entities/review.entity';
import { EmojiRating, EMOJI_DISPLAY, EMOJI_SCORE } from '@/modules/reviews/domain/enums/emoji-rating.enum';
import { ReviewerRole } from '@/modules/reviews/domain/enums/reviewer-role.enum';
import { DomainException } from '@/domain/exceptions/domain.exception';

const validProps = {
  tripId: 'trip-1',
  reviewerId: 'pass-1',
  reviewerRole: ReviewerRole.PASSENGER,
  reviewedUserId: 'driver-1',
  rating: EmojiRating.EXCELLENT,
  comment: '¡Excelente conductor!',
};

describe('ReviewEntity', () => {
  describe('create()', () => {
    it('should create a review with all valid properties', () => {
      const review = ReviewEntity.create(validProps);

      expect(review.id).toBeDefined();
      expect(review.tripId).toBe('trip-1');
      expect(review.reviewerId).toBe('pass-1');
      expect(review.reviewerRole).toBe(ReviewerRole.PASSENGER);
      expect(review.reviewedUserId).toBe('driver-1');
      expect(review.rating).toBe(EmojiRating.EXCELLENT);
      expect(review.comment).toBe('¡Excelente conductor!');
      expect(review.submittedAt).toBeInstanceOf(Date);
    });

    it('should create a review without comment (optional)', () => {
      const review = ReviewEntity.create({ ...validProps, comment: undefined });
      expect(review.comment).toBeUndefined();
    });

    it('should create review for all emoji ratings', () => {
      const ratings = Object.values(EmojiRating);
      for (const rating of ratings) {
        const review = ReviewEntity.create({ ...validProps, rating });
        expect(review.rating).toBe(rating);
      }
    });

    it('should allow DRIVER to review a PASSENGER', () => {
      const review = ReviewEntity.create({
        ...validProps,
        reviewerId: 'driver-1',
        reviewerRole: ReviewerRole.DRIVER,
        reviewedUserId: 'pass-1',
      });
      expect(review.reviewerRole).toBe(ReviewerRole.DRIVER);
    });

    it('should throw DomainException if tripId is missing', () => {
      expect(() =>
        ReviewEntity.create({ ...validProps, tripId: '' }),
      ).toThrow(DomainException);
    });

    it('should throw DomainException if reviewerId is missing', () => {
      expect(() =>
        ReviewEntity.create({ ...validProps, reviewerId: '' }),
      ).toThrow(DomainException);
    });

    it('should throw DomainException if reviewedUserId is missing', () => {
      expect(() =>
        ReviewEntity.create({ ...validProps, reviewedUserId: '' }),
      ).toThrow(DomainException);
    });

    it('should throw DomainException if reviewer and reviewed are the same user', () => {
      expect(() =>
        ReviewEntity.create({
          ...validProps,
          reviewerId: 'same-user',
          reviewedUserId: 'same-user',
        }),
      ).toThrow(DomainException);
    });

    it('should throw DomainException if comment exceeds 500 characters', () => {
      expect(() =>
        ReviewEntity.create({ ...validProps, comment: 'a'.repeat(501) }),
      ).toThrow(DomainException);
    });

    it('should generate unique ids for each review', () => {
      const r1 = ReviewEntity.create(validProps);
      const r2 = ReviewEntity.create(validProps);
      expect(r1.id).not.toBe(r2.id);
    });
  });

  describe('emojiDisplay()', () => {
    it('should return 😍 for EXCELLENT', () => {
      const review = ReviewEntity.create({ ...validProps, rating: EmojiRating.EXCELLENT });
      expect(review.emojiDisplay()).toBe('😍');
    });

    it('should return 😊 for GOOD', () => {
      const review = ReviewEntity.create({ ...validProps, rating: EmojiRating.GOOD });
      expect(review.emojiDisplay()).toBe('😊');
    });

    it('should return 😐 for NEUTRAL', () => {
      const review = ReviewEntity.create({ ...validProps, rating: EmojiRating.NEUTRAL });
      expect(review.emojiDisplay()).toBe('😐');
    });

    it('should return 😕 for POOR', () => {
      const review = ReviewEntity.create({ ...validProps, rating: EmojiRating.POOR });
      expect(review.emojiDisplay()).toBe('😕');
    });

    it('should return 😠 for BAD', () => {
      const review = ReviewEntity.create({ ...validProps, rating: EmojiRating.BAD });
      expect(review.emojiDisplay()).toBe('😠');
    });

    it('should match EMOJI_DISPLAY map', () => {
      for (const [key, emoji] of Object.entries(EMOJI_DISPLAY)) {
        const review = ReviewEntity.create({ ...validProps, rating: key as EmojiRating });
        expect(review.emojiDisplay()).toBe(emoji);
      }
    });
  });

  describe('numericScore()', () => {
    it('should return 5 for EXCELLENT', () => {
      const review = ReviewEntity.create({ ...validProps, rating: EmojiRating.EXCELLENT });
      expect(review.numericScore()).toBe(5);
    });

    it('should return 1 for BAD', () => {
      const review = ReviewEntity.create({ ...validProps, rating: EmojiRating.BAD });
      expect(review.numericScore()).toBe(1);
    });

    it('should return correct score for all ratings', () => {
      for (const [key, score] of Object.entries(EMOJI_SCORE)) {
        const review = ReviewEntity.create({ ...validProps, rating: key as EmojiRating });
        expect(review.numericScore()).toBe(score);
      }
    });
  });
});
