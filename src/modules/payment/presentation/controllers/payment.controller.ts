import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Req,
  Headers,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiExcludeEndpoint,
} from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../../../../shared/guards/jwt-auth.guard';
import { InitiateSubscriptionPaymentUseCase } from '../../application/use-cases/initiate-subscription-payment.use-case';
import { HandleWompiWebhookUseCase } from '../../application/use-cases/handle-wompi-webhook.use-case';
import { GetPaymentStatusUseCase } from '../../application/use-cases/get-payment-status.use-case';
import { InitiatePaymentDto } from '../../application/dtos/initiate-payment.dto';

@ApiTags('payments')
@Controller('payments')
export class PaymentController {
  constructor(
    private readonly initiatePaymentUseCase: InitiateSubscriptionPaymentUseCase,
    private readonly handleWebhookUseCase: HandleWompiWebhookUseCase,
    private readonly getStatusUseCase: GetPaymentStatusUseCase,
  ) {}

  @Post('subscriptions/checkout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Iniciar pago de suscripción con Wompi',
    description:
      'Crea una transacción y devuelve el enlace de pago de Wompi. El conductor es redirigido al checkout.',
  })
  @ApiResponse({ status: 201, description: 'Enlace de pago generado' })
  @ApiResponse({ status: 403, description: 'Documentos no aprobados' })
  @ApiResponse({ status: 404, description: 'Plan no encontrado' })
  async initiatePayment(
    @Body() dto: InitiatePaymentDto,
    @Req() req: { user?: { id?: string } },
  ) {
    return this.initiatePaymentUseCase.execute({
      driverId: req.user?.id ?? '',
      planId: dto.planId,
      method: dto.method,
      customerEmail: dto.customerEmail,
      customerFullName: dto.customerFullName,
      redirectUrl: dto.redirectUrl,
    });
  }

  @Post('webhook/wompi')
  @HttpCode(200)
  @ApiExcludeEndpoint()
  async wompiWebhook(
    @Headers('x-wompi-signature') signature: string,
    @Req() req: Request & { rawBody?: Buffer },
  ) {
    const rawPayload = req.rawBody?.toString('utf-8') ?? '';
    const body = req.body as {
      data: { transaction: { id: string; reference: string; status: string } };
    };
    const tx = body?.data?.transaction;

    await this.handleWebhookUseCase.execute({
      signature: signature ?? '',
      rawPayload,
      wompiTransactionId: tx?.id ?? '',
      reference: tx?.reference ?? '',
      status: tx?.status ?? '',
    });
    return { received: true };
  }

  @Get('transactions/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Estado de una transacción de pago' })
  @ApiResponse({ status: 200, description: 'Información de la transacción' })
  async getStatus(@Param('id') id: string) {
    return this.getStatusUseCase.execute(id);
  }
}
