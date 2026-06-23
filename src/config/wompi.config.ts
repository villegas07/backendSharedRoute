import { registerAs } from '@nestjs/config';

export const wompiConfig = registerAs('wompi', () => ({
  publicKey: process.env.WOMPI_PUBLIC_KEY || '',
  privateKey: process.env.WOMPI_PRIVATE_KEY || '',
  eventsSecret: process.env.WOMPI_EVENTS_SECRET || '',
  baseUrl: process.env.WOMPI_BASE_URL || 'https://sandbox.wompi.co/v1',
  currency: process.env.WOMPI_CURRENCY || 'COP',
}));
