import {
  Controller,
  Post,
  Get,
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
import { OpenSupportTicketUseCase } from '../../application/use-cases/open-support-ticket.use-case';
import { GetMyTicketsUseCase } from '../../application/use-cases/get-my-tickets.use-case';
import { UpdateTicketStatusUseCase } from '../../application/use-cases/update-ticket-status.use-case';
import { OpenSupportTicketDto } from '../../application/dtos/open-support-ticket.dto';

@ApiTags('support')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('support')
export class SupportController {
  constructor(
    private readonly openTicketUseCase: OpenSupportTicketUseCase,
    private readonly getMyTicketsUseCase: GetMyTicketsUseCase,
    private readonly updateStatusUseCase: UpdateTicketStatusUseCase,
  ) {}

  @Post('tickets')
  @ApiOperation({
    summary: 'Abrir ticket de soporte',
    description:
      'Crea un ticket y abre automáticamente una sesión de chat de soporte con el equipo. ' +
      'Usa el mismo canal de chat que los viajes para comunicarse con el agente.',
  })
  @ApiResponse({ status: 201, description: 'Ticket creado y chat de soporte abierto' })
  async openTicket(
    @Body() dto: OpenSupportTicketDto,
    @Req() req: { user?: { id?: string } },
  ) {
    return this.openTicketUseCase.execute({
      userId: req.user?.id ?? '',
      ...dto,
    });
  }

  @Get('tickets')
  @ApiOperation({ summary: 'Mis tickets de soporte', description: 'Historial de tickets del usuario autenticado.' })
  async getMyTickets(@Req() req: { user?: { id?: string } }) {
    return this.getMyTicketsUseCase.execute(req.user?.id ?? '');
  }

  @Get('tickets/:id')
  @ApiOperation({ summary: 'Detalle de un ticket' })
  async getTicket(@Param('id') id: string) {
    return this.updateStatusUseCase.execute({
      ticketId: id,
      agentId: '',
      action: 'assign',
    });
  }

  @Patch('tickets/:id/assign')
  @ApiOperation({ summary: 'Asignar ticket a un agente (admin)' })
  async assign(
    @Param('id') id: string,
    @Req() req: { user?: { id?: string } },
  ) {
    return this.updateStatusUseCase.execute({
      ticketId: id,
      agentId: req.user?.id ?? '',
      action: 'assign',
    });
  }

  @Patch('tickets/:id/resolve')
  @ApiOperation({ summary: 'Marcar ticket como resuelto (admin/agente)' })
  async resolve(
    @Param('id') id: string,
    @Req() req: { user?: { id?: string } },
  ) {
    return this.updateStatusUseCase.execute({
      ticketId: id,
      agentId: req.user?.id ?? '',
      action: 'resolve',
    });
  }

  @Patch('tickets/:id/close')
  @ApiOperation({ summary: 'Cerrar ticket' })
  async close(
    @Param('id') id: string,
    @Req() req: { user?: { id?: string } },
  ) {
    return this.updateStatusUseCase.execute({
      ticketId: id,
      agentId: req.user?.id ?? '',
      action: 'close',
    });
  }
}
