import { PaymentMethod } from '../enums/payment-method.enum';

export interface WompiCheckoutInput {
  amountInCents: number;
  currency: string;
  reference: string;
  redirectUrl: string;
  method: PaymentMethod;
  customerEmail: string;
  customerFullName: string;
}

export interface WompiCheckoutResult {
  wompiTransactionId: string;
  paymentLink: string;
  status: string;
}

export interface WompiTransactionStatus {
  id: string;
  reference: string;
  status: string;
  amountInCents: number;
  currency: string;
  paymentMethod: string;
  approvedAt?: string;
}

export abstract class WompiPort {
  abstract createCheckout(
    input: WompiCheckoutInput,
  ): Promise<WompiCheckoutResult>;

  abstract getTransactionStatus(
    wompiTransactionId: string,
  ): Promise<WompiTransactionStatus>;

  abstract validateWebhookSignature(
    signature: string,
    payload: string,
  ): boolean;
}
