import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EmojiRating } from '../../domain/enums/emoji-rating.enum';

export class ReviewResponseDto {
  @ApiProperty({ example: 'uuid-v4' })
  id: string;

  @ApiProperty({ example: 'trip-uuid' })
  tripId: string;

  @ApiProperty({ example: 'pass-uuid' })
  reviewerId: string;

  @ApiProperty({ example: 'PASSENGER', enum: ['DRIVER', 'PASSENGER'] })
  reviewerRole: string;

  @ApiProperty({ example: 'driver-uuid' })
  reviewedUserId: string;

  @ApiProperty({ enum: EmojiRating, example: EmojiRating.EXCELLENT })
  rating: EmojiRating;

  @ApiProperty({ example: '😍' })
  emojiDisplay: string;

  @ApiProperty({ example: 5 })
  numericScore: number;

  @ApiPropertyOptional({ example: '¡Excelente conductor! Muy puntual.' })
  comment?: string;

  @ApiProperty()
  submittedAt: Date;
}

export class UserRatingSummaryResponseDto {
  @ApiProperty({ example: 'driver-uuid' })
  userId: string;

  @ApiProperty({ example: 24 })
  totalReviews: number;

  @ApiProperty({ example: 4.75 })
  averageScore: number;

  @ApiProperty({ example: '😍' })
  dominantEmoji: string;

  @ApiProperty({
    example: { EXCELLENT: 18, GOOD: 4, NEUTRAL: 1, POOR: 1, BAD: 0 },
  })
  ratingBreakdown: Record<string, number>;
}
