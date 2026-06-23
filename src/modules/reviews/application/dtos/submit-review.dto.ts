import { IsEnum, IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EmojiRating, EMOJI_DISPLAY } from '../../domain/enums/emoji-rating.enum';

export class SubmitReviewDto {
  @ApiProperty({
    enum: EmojiRating,
    description: `Calificación con emoji: ${Object.entries(EMOJI_DISPLAY)
      .map(([k, v]) => `${v} ${k}`)
      .join(', ')}`,
    example: EmojiRating.EXCELLENT,
  })
  @IsEnum(EmojiRating)
  rating: EmojiRating;

  @ApiPropertyOptional({
    description: 'Comentario opcional sobre el viaje (máx 500 caracteres)',
    example: '¡Excelente conductor! Muy puntual y amable.',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  comment?: string;
}
