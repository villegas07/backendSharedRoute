import { GetUserRatingUseCase } from '@/modules/reviews/application/use-cases/get-user-rating.use-case';
import { GetTripReviewsUseCase } from '@/modules/reviews/application/use-cases/get-trip-reviews.use-case';
import { ReviewRepository, UserRatingSummary } from '@/modules/reviews/domain/ports/review.repository';
import { ReviewEntity } from '@/modules/reviews/domain/entities/review.entity';
import { EmojiRating } from '@/modules/reviews/domain/enums/emoji-rating.enum';
import { ReviewerRole } from '@/modules/reviews/domain/enums/reviewer-role.enum';

const makeMockRepo = (): jest.Mocked<ReviewRepository> => ({
  save: jest.fn(),
  findById: jest.fn(),
  findByTripId: jest.fn(),
  findByReviewedUserId: jest.fn(),
  existsByTripAndReviewer: jest.fn(),
  getRatingSummary: jest.fn(),
} as jest.Mocked<ReviewRepository>);

const makeReview = (rating: EmojiRating) =>
  ReviewEntity.create({
    tripId: 'trip-1',
    reviewerId: 'pass-1',
    reviewerRole: ReviewerRole.PASSENGER,
    reviewedUserId: 'driver-1',
    rating,
  });

describe('GetUserRatingUseCase', () => {
  let useCase: GetUserRatingUseCase;
  let repo: jest.Mocked<ReviewRepository>;

  beforeEach(() => {
    repo = makeMockRepo();
    useCase = new GetUserRatingUseCase(repo);
  });

  it('should return full rating summary for a user', async () => {
    const summary: UserRatingSummary = {
      userId: 'driver-1',
      totalReviews: 3,
      averageScore: 4.33,
      dominantEmoji: '😊',
      ratingBreakdown: {
        EXCELLENT: 1,
        GOOD: 2,
        NEUTRAL: 0,
        POOR: 0,
        BAD: 0,
      },
    };
    repo.getRatingSummary.mockResolvedValue(summary);

    const result = await useCase.execute('driver-1');

    expect(result.totalReviews).toBe(3);
    expect(result.averageScore).toBeCloseTo(4.33, 1);
    expect(result.dominantEmoji).toBe('😊');
    expect(repo.getRatingSummary).toHaveBeenCalledWith('driver-1');
  });

  it('should return zero summary for user with no reviews', async () => {
    const empty: UserRatingSummary = {
      userId: 'new-user',
      totalReviews: 0,
      averageScore: 0,
      dominantEmoji: '',
      ratingBreakdown: {
        EXCELLENT: 0, GOOD: 0, NEUTRAL: 0, POOR: 0, BAD: 0,
      },
    };
    repo.getRatingSummary.mockResolvedValue(empty);

    const result = await useCase.execute('new-user');
    expect(result.totalReviews).toBe(0);
    expect(result.averageScore).toBe(0);
  });
});

describe('GetTripReviewsUseCase', () => {
  let useCase: GetTripReviewsUseCase;
  let repo: jest.Mocked<ReviewRepository>;

  beforeEach(() => {
    repo = makeMockRepo();
    useCase = new GetTripReviewsUseCase(repo);
  });

  it('should return all reviews for a trip', async () => {
    const reviews = [
      makeReview(EmojiRating.EXCELLENT),
      makeReview(EmojiRating.GOOD),
    ];
    repo.findByTripId.mockResolvedValue(reviews);

    const result = await useCase.execute('trip-1');

    expect(result).toHaveLength(2);
    expect(repo.findByTripId).toHaveBeenCalledWith('trip-1');
  });

  it('should return empty array when trip has no reviews', async () => {
    repo.findByTripId.mockResolvedValue([]);

    const result = await useCase.execute('no-reviews');
    expect(result).toEqual([]);
  });
});
