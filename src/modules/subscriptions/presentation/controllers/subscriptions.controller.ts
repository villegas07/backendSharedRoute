import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../shared/guards/jwt-auth.guard';
import { CurrentUser } from '../../../../shared/decorators/current-user.decorator';
import { GetPlansUseCase } from '../../application/use-cases/get-plans.use-case';
import { PurchaseSubscriptionUseCase } from '../../application/use-cases/purchase-subscription.use-case';
import { GetMySubscriptionUseCase } from '../../application/use-cases/get-my-subscription.use-case';
import { PurchaseSubscriptionDto } from '../../application/dtos/purchase-subscription.dto';
import { SubscriptionPlanResponseDto } from '../../application/dtos/subscription-plan-response.dto';
import { SubscriptionResponseDto } from '../../application/dtos/subscription-response.dto';

@ApiTags('subscriptions')
@ApiBearerAuth('access-token')
@Controller('subscriptions')
@UseGuards(JwtAuthGuard)
export class SubscriptionsController {
  constructor(
    private readonly getPlansUseCase: GetPlansUseCase,
    private readonly purchaseSubscriptionUseCase: PurchaseSubscriptionUseCase,
    private readonly getMySubscriptionUseCase: GetMySubscriptionUseCase,
  ) {}

  @Get('plans')
  @ApiOperation({ summary: 'Listar planes disponibles', description: 'Retorna los planes de suscripción: 24h, días y mensual.' })
  @ApiResponse({ status: 200, type: [SubscriptionPlanResponseDto] })
  getPlans(): Promise<SubscriptionPlanResponseDto[]> {
    return this.getPlansUseCase.execute();
  }

  @Post('purchase')
  @ApiOperation({
    summary: 'Comprar suscripción',
    description: 'Requiere tener SOAT, Licencia y Cédula aprobados por el admin.',
  })
  @ApiResponse({ status: 201, type: SubscriptionResponseDto })
  @ApiResponse({ status: 403, description: 'Documentos pendientes o rechazados.' })
  purchase(
    @Body() dto: PurchaseSubscriptionDto,
    @CurrentUser() user: { sub: string },
  ): Promise<SubscriptionResponseDto> {
    return this.purchaseSubscriptionUseCase.execute({ driverId: user.sub, dto });
  }

  @Get('my')
  @ApiOperation({ summary: 'Mi suscripción activa' })
  @ApiResponse({ status: 200, type: SubscriptionResponseDto })
  @ApiResponse({ status: 404, description: 'Sin suscripción activa.' })
  getMySubscription(@CurrentUser() user: { sub: string }): Promise<SubscriptionResponseDto> {
    return this.getMySubscriptionUseCase.execute(user.sub);
  }
}
