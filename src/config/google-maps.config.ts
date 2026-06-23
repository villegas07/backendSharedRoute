import { registerAs } from '@nestjs/config';

export const googleMapsConfig = registerAs('googleMaps', () => ({
  apiKey: process.env.GOOGLE_MAPS_API_KEY || '',
  defaultLanguage: process.env.GOOGLE_MAPS_LANGUAGE || 'es',
  defaultRegion: process.env.GOOGLE_MAPS_REGION || 'co',
}));
