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
  ApiParam,
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
import { EmergencyContactResponseDto, SosAlertResponseDto } from '../../application/dtos/sos-response.dto';

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
  @ApiOperation({ summary: 'Registrar contacto de emergencia', description: 'Máximo 3 contactos por usuario. Válido para conductor y pasajero.' })
  @ApiResponse({ status: 201, type: EmergencyContactResponseDto, description: 'Contacto registrado' })
  @ApiResponse({ status: 400, description: 'Ya tienes 3 contactos registrados.' })
  async registerContact(
    @Body() dto: RegisterEmergencyContactDto,
    @Req() req: { user?: { id?: string } },
  ) {
    return this.registerContactUseCase.execute({ userId: req.user?.id ?? '', ...dto });
  }

  @Get('emergency-contacts')
  @ApiOperation({ summary: 'Mis contactos de emergencia' })
  @ApiResponse({ status: 200, type: [EmergencyContactResponseDto] })
  async getContacts(@Req() req: { user?: { id?: string } }) {
    return this.getContactsUseCase.execute(req.user?.id ?? '');
  }

  @Delete('emergency-contacts/:id')
  @ApiParam({ name: 'id', description: 'UUID del contacto de emergencia', type: 'string' })
  @ApiOperation({ summary: 'Eliminar contacto de emergencia' })
  @ApiResponse({ status: 200, description: 'Contacto eliminado.' })
  @ApiResponse({ status: 404, description: 'Contacto no encontrado.' })
  async deleteContact(@Param('id') id: string) {
    return this.deleteContactUseCase.execute(id);
  }

  @Post('alerts')
  @ApiOperation({
    summary: '🚨 Activar alerta SOS',
    description: 'Dispara una emergencia: notifica a los contactos registrados y hace broadcast vía WebSocket a todos los clientes conectados.',
  })
  @ApiResponse({ status: 201, type: SosAlertResponseDto, description: 'Alerta SOS activada' })
  async triggerSos(
    @Body() dto: TriggerSosDto,
    @Req() req: { user?: { id?: string } },
  ) {
    const alert = await this.triggerSosUseCase.execute({ userId: req.user?.id ?? '', ...dto });
    this.sosGateway.broadcastSosTriggered(alert);
    return alert;
  }

  @Patch('alerts/:id/resolve')
  @ApiParam({ name: 'id', description: 'UUID de la alerta SOS', type: 'string' })
  @ApiOperation({ summary: 'Resolver alerta SOS' })
  @ApiResponse({ status: 200, type: SosAlertResponseDto })
  @ApiResponse({ status: 404, description: 'Alerta no encontrada.' })
  async resolveAlert(
    @Param('id') id: string,
    @Req() req: { user?: { id?: string } },
  ) {
    const alert = await this.resolveAlertUseCase.execute({ alertId: id, resolvedById: req.user?.id ?? '' });
    this.sosGateway.broadcastSosResolved(alert.id, req.user?.id ?? '');
    return alert;
  }

  @Get('alerts/active')
  @ApiOperation({ summary: 'Ver alertas SOS activas (admin)' })
  async getActiveAlerts() {
    return [];
  }
}
