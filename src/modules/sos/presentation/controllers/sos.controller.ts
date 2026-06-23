import {
  Controller,
  Post,
  Get,
  Delete,
  Patch,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../shared/guards/jwt-auth.guard';
import { RegisterEmergencyContactUseCase } from '../../application/use-cases/register-emergency-contact.use-case';
import { GetEmergencyContactsUseCase } from '../../application/use-cases/get-emergency-contacts.use-case';
import { DeleteEmergencyContactUseCase } from '../../application/use-cases/delete-emergency-contact.use-case';
import { TriggerSosAlertUseCase } from '../../application/use-cases/trigger-sos-alert.use-case';
import { ResolveSosAlertUseCase } from '../../application/use-cases/resolve-sos-alert.use-case';
import { SosGateway } from '../gateways/sos.gateway';
import { RegisterEmergencyContactDto } from '../../application/dtos/register-emergency-contact.dto';
import { TriggerSosDto } from '../../application/dtos/trigger-sos.dto';

@ApiTags('sos')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('sos')
export class SosController {
  constructor(
    private readonly registerContactUseCase: RegisterEmergencyContactUseCase,
    private readonly getContactsUseCase: GetEmergencyContactsUseCase,
    private readonly deleteContactUseCase: DeleteEmergencyContactUseCase,
    private readonly triggerSosUseCase: TriggerSosAlertUseCase,
    private readonly resolveAlertUseCase: ResolveSosAlertUseCase,
    private readonly sosGateway: SosGateway,
  ) {}

  @Post('emergency-contacts')
  @ApiOperation({ summary: 'Registrar contacto de emergencia', description: 'Cada usuario (conductor/pasajero) puede registrar hasta 3 contactos.' })
  @ApiResponse({ status: 201, description: 'Contacto registrado exitosamente' })
  async registerContact(
    @Body() dto: RegisterEmergencyContactDto,
    @Req() req: { user?: { id?: string } },
  ) {
    return this.registerContactUseCase.execute({
      userId: req.user?.id ?? '',
      ...dto,
    });
  }

  @Get('emergency-contacts')
  @ApiOperation({ summary: 'Listar contactos de emergencia del usuario autenticado' })
  async getContacts(@Req() req: { user?: { id?: string } }) {
    return this.getContactsUseCase.execute(req.user?.id ?? '');
  }

  @Delete('emergency-contacts/:id')
  @ApiOperation({ summary: 'Eliminar un contacto de emergencia' })
  async deleteContact(@Param('id') id: string) {
    return this.deleteContactUseCase.execute(id);
  }

  @Post('alerts')
  @ApiOperation({
    summary: 'Activar alerta SOS',
    description: 'Dispara una emergencia: notifica contactos y broadcast en tiempo real.',
  })
  @ApiResponse({ status: 201, description: 'Alerta SOS activada' })
  async triggerSos(
    @Body() dto: TriggerSosDto,
    @Req() req: { user?: { id?: string } },
  ) {
    const alert = await this.triggerSosUseCase.execute({
      userId: req.user?.id ?? '',
      ...dto,
    });
    this.sosGateway.broadcastSosTriggered(alert);
    return alert;
  }

  @Patch('alerts/:id/resolve')
  @ApiOperation({ summary: 'Marcar alerta SOS como resuelta' })
  async resolveAlert(
    @Param('id') id: string,
    @Req() req: { user?: { id?: string } },
  ) {
    const alert = await this.resolveAlertUseCase.execute({
      alertId: id,
      resolvedById: req.user?.id ?? '',
    });
    this.sosGateway.broadcastSosResolved(alert.id, req.user?.id ?? '');
    return alert;
  }

  @Get('alerts/active')
  @ApiOperation({ summary: 'Ver alertas SOS activas (admin)' })
  async getActiveAlerts() {
    return [];
  }
}
