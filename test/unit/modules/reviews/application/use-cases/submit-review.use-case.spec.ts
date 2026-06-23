import { SubmitReviewUseCase } from '@/modules/reviews/application/use-cases/submit-review.use-case';
import { ReviewRepository } from '@/modules/reviews/domain/ports/review.repository';
import { TripReviewPort } from '@/modules/reviews/domain/ports/trip-review.port';
import { EmojiRating } from '@/modules/reviews/domain/enums/emoji-rating.enum';
import { ReviewerRole } from '@/modules/reviews/domain/enums/reviewer-role.enum';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';

const makeMockReviewRepo = (): jest.Mocked<ReviewRepository> => ({
  save: jest.fn(),
  findById: jest.fn(),
  findByTripId: jest.fn(),
  findByReviewedUserId: jest.fn(),
  existsByTripAndReviewer: jest.fn(),
  getRatingSummary: jest.fn(),
} as jest.Mocked<ReviewRepository>);

const makeMockTripPort = (): jest.Mocked<TripReviewPort> => ({
  getTripParticipants: jest.fn(),
} as jest.Mocked<TripReviewPort>);

const completedTrip = {
  driverId: 'driver-1',
  passengerIds: ['pass-1', 'pass-2'],
  isCompleted: true,
};

const passengerInput = {
  tripId: 'trip-1',
  reviewerId: 'pass-1',
  reviewerRole: ReviewerRole.PASSENGER,
  reviewedUserId: 'driver-1',
  rating: EmojiRating.EXCELLENT,
  comment: '¡Perfecto!',
};

describe('SubmitReviewUseCase', () => {
  let useCase: SubmitReviewUseCase;
  let reviewRepo: jest.Mocked<ReviewRepository>;
  let tripPort: jest.Mocked<TripReviewPort>;

  beforeEach(() => {
    reviewRepo = makeMockReviewRepo();
    tripPort = makeMockTripPort();
    useCase = new SubmitReviewUseCase(reviewRepo, tripPort);
  });

  it('should create review when passenger rates driver on completed trip', async () => {
    tripPort.getTripParticipants.mockResolvedValue(completedTrip);
    reviewRepo.existsByTripAndReviewer.mockResolvedValue(false);

    const result = await useCase.execute(passengerInput);

    expect(result.rating).toBe(EmojiRating.EXCELLENT);
    expect(result.reviewerId).toBe('pass-1');
    expect(result.reviewedUserId).toBe('driver-1');
    expect(reviewRepo.save).toHaveBeenCalledWith(result);
  });

  it('should create review when driver rates a passenger', async () => {
    tripPort.getTripParticipants.mockResolvedValue(completedTrip);
    reviewRepo.existsByTripAndReviewer.mockResolvedValue(false);

    const result = await useCase.execute({
      tripId: 'trip-1',
      reviewerId: 'driver-1',
      reviewerRole: ReviewerRole.DRIVER,
      reviewedUserId: 'pass-1',
      rating: EmojiRating.GOOD,
    });

    expect(result.reviewerRole).toBe(ReviewerRole.DRIVER);
    expect(result.reviewedUserId).toBe('pass-1');
  });

  it('should create review with all emoji types', async () => {
    tripPort.getTripParticipants.mockResolvedValue(completedTrip);
    reviewRepo.existsByTripAndReviewer.mockResolvedValue(false);

    for (const rating of Object.values(EmojiRating)) {
      reviewRepo.save.mockClear();
      const result = await useCase.execute({ ...passengerInput, rating });
      expect(result.rating).toBe(rating);
    }
  });

  it('should throw NotFoundException if trip does not exist', async () => {
    tripPort.getTripParticipants.mockResolvedValue(null);

    await expect(useCase.execute(passengerInput)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should throw BadRequestException if trip is not completed', async () => {
    tripPort.getTripParticipants.mockResolvedValue({
      ...completedTrip,
      isCompleted: false,
    });

    await expect(useCase.execute(passengerInput)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should throw ForbiddenException if reviewer was not a participant', async () => {
    tripPort.getTripParticipants.mockResolvedValue(completedTrip);
    reviewRepo.existsByTripAndReviewer.mockResolvedValue(false);

    await expect(
      useCase.execute({ ...passengerInput, reviewerId: 'stranger' }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('should throw ConflictException if reviewer already rated on this trip', async () => {
    tripPort.getTripParticipants.mockResolvedValue(completedTrip);
    reviewRepo.existsByTripAndReviewer.mockResolvedValue(true);

    await expect(useCase.execute(passengerInput)).rejects.toThrow(
      ConflictException,
    );
  });

  it('should create review without comment (optional)', async () => {
    tripPort.getTripParticipants.mockResolvedValue(completedTrip);
    reviewRepo.existsByTripAndReviewer.mockResolvedValue(false);

    const result = await useCase.execute({
      ...passengerInput,
      comment: undefined,
    });

    expect(result.comment).toBeUndefined();
  });
});
