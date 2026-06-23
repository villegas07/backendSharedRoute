import { IsString, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class WompiWebhookDto {
  @ApiProperty({ description: 'Firma de integridad HMAC-SHA256 de Wompi' })
  @IsString()
  signature: string;

  @ApiProperty()
  @IsObject()
  data: {
    transaction: {
      id: string;
      reference: string;
      status: string;
      amount_in_cents: number;
      currency: string;
    };
  };
}
