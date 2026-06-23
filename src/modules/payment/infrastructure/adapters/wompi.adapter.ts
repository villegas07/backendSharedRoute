import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import {
  WompiPort,
  WompiCheckoutInput,
  WompiCheckoutResult,
  WompiTransactionStatus,
} from '../../domain/ports/wompi.port';

// STUB adapter — calls real Wompi sandbox API in production
@Injectable()
export class WompiAdapter extends WompiPort {
  private readonly logger = new Logger(WompiAdapter.name);
  private readonly publicKey: string;
  private readonly eventsSecret: string;
  private readonly baseUrl: string;

  constructor(private readonly configService: ConfigService) {
    super();
    this.publicKey = configService.get<string>('wompi.publicKey', '');
    this.eventsSecret = configService.get<string>('wompi.eventsSecret', '');
    this.baseUrl = configService.get<string>(
      'wompi.baseUrl',
      'https://sandbox.wompi.co/v1',
    );
  }

  async createCheckout(
    input: WompiCheckoutInput,
  ): Promise<WompiCheckoutResult> {
    // Real integration: POST to Wompi /transactions or generate payment link
    // Stub returns a sandbox redirect link using public key
    const paymentLink =
      `${this.baseUrl.replace('/v1', '')}/checkout` +
      `?public-key=${this.publicKey}` +
      `&currency=${input.currency}` +
      `&amount-in-cents=${input.amountInCents}` +
      `&reference=${input.reference}` +
      `&redirect-url=${encodeURIComponent(input.redirectUrl)}` +
      `&customer-email=${encodeURIComponent(input.customerEmail)}`;

    this.logger.log(`[Wompi] Checkout created for reference: ${input.reference}`);

    return {
      wompiTransactionId: `wompi-pending-${input.reference}`,
      paymentLink,
      status: 'PENDING',
    };
  }

  async getTransactionStatus(
    wompiTransactionId: string,
  ): Promise<WompiTransactionStatus> {
    // In production: GET /transactions/:id with private key auth
    this.logger.log(`[Wompi] Fetching status for: ${wompiTransactionId}`);
    return {
      id: wompiTransactionId,
      reference: '',
      status: 'PENDING',
      amountInCents: 0,
      currency: 'COP',
      paymentMethod: 'UNKNOWN',
    };
  }

  validateWebhookSignature(signature: string, payload: string): boolean {
    const expected = crypto
      .createHmac('sha256', this.eventsSecret)
      .update(payload)
      .digest('hex');
    return expected === signature;
  }
}
