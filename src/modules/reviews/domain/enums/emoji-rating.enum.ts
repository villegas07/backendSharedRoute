export enum EmojiRating {
  EXCELLENT = 'EXCELLENT', // 😍
  GOOD = 'GOOD',           // 😊
  NEUTRAL = 'NEUTRAL',     // 😐
  POOR = 'POOR',           // 😕
  BAD = 'BAD',             // 😠
}

export const EMOJI_DISPLAY: Record<EmojiRating, string> = {
  [EmojiRating.EXCELLENT]: '😍',
  [EmojiRating.GOOD]: '😊',
  [EmojiRating.NEUTRAL]: '😐',
  [EmojiRating.POOR]: '😕',
  [EmojiRating.BAD]: '😠',
};

export const EMOJI_SCORE: Record<EmojiRating, number> = {
  [EmojiRating.EXCELLENT]: 5,
  [EmojiRating.GOOD]: 4,
  [EmojiRating.NEUTRAL]: 3,
  [EmojiRating.POOR]: 2,
  [EmojiRating.BAD]: 1,
};
