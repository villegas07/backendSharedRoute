import { BaseEntity } from '../../../../domain/entities/base.entity';
import { DomainException } from '../../../../domain/exceptions/domain.exception';
import { EmojiRating, EMOJI_DISPLAY, EMOJI_SCORE } from '../enums/emoji-rating.enum';
import { ReviewerRole } from '../enums/reviewer-role.enum';

export interface ReviewProps {
  id?: string;
  tripId: string;
  reviewerId: string;
  reviewerRole: ReviewerRole;
  reviewedUserId: string;
  rating: EmojiRating;
  comment?: string;
}

const MAX_COMMENT_LENGTH = 500;

export class ReviewEntity extends BaseEntity {
  readonly tripId: string;
  readonly reviewerId: string;
  readonly reviewerRole: ReviewerRole;
  readonly reviewedUserId: string;
  readonly rating: EmojiRating;
  readonly comment?: string;
  readonly submittedAt: Date;

  private constructor(props: ReviewProps) {
    super(props.id);
    this.tripId = props.tripId;
    this.reviewerId = props.reviewerId;
    this.reviewerRole = props.reviewerRole;
    this.reviewedUserId = props.reviewedUserId;
    this.rating = props.rating;
    this.comment = props.comment;
    this.submittedAt = new Date();
  }

  static create(props: ReviewProps): ReviewEntity {
    ReviewEntity.validate(props);
    return new ReviewEntity(props);
  }

  emojiDisplay(): string {
    return EMOJI_DISPLAY[this.rating];
  }

  numericScore(): number {
    return EMOJI_SCORE[this.rating];
  }

  private static validate(props: ReviewProps): void {
    if (!props.tripId?.trim()) {
      throw new DomainException('Trip ID is required', 'MISSING_TRIP_ID');
    }
    if (!props.reviewerId?.trim()) {
      throw new DomainException('Reviewer ID is required', 'MISSING_REVIEWER_ID');
    }
    if (!props.reviewedUserId?.trim()) {
      throw new DomainException(
        'Reviewed user ID is required',
        'MISSING_REVIEWED_USER_ID',
      );
    }
    if (props.reviewerId === props.reviewedUserId) {
      throw new DomainException(
        'You cannot review yourself',
        'SELF_REVIEW_NOT_ALLOWED',
      );
    }
    if (props.comment && props.comment.length > MAX_COMMENT_LENGTH) {
      throw new DomainException(
        `Comment cannot exceed ${MAX_COMMENT_LENGTH} characters`,
        'COMMENT_TOO_LONG',
      );
    }
  }
}
