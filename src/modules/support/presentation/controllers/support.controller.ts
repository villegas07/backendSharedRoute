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
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../shared/guards/jwt-auth.guard';
import { OpenSupportTicketUseCase } from '../../application/use-cases/open-support-ticket.use-case';
import { GetMyTicketsUseCase } from '../../application/use-cases/get-my-tickets.use-case';
import { UpdateTicketStatusUseCase } from '../../application/use-cases/update-ticket-status.use-case';
import { OpenSupportTicketDto } from '../../application/dtos/open-support-ticket.dto';
import { OpenSupportTicketResponseDto, SupportTicketResponseDto } from '../../application/dtos/support-response.dto';

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
      'Usa el mismo canal de chat (/chat WebSocket, room: chat:support-{ticketId}) para comunicarse con el agente.',
  })
  @ApiResponse({ status: 201, type: OpenSupportTicketResponseDto, description: 'Ticket creado y chat de soporte abierto' })
  async openTicket(
    @Body() dto: OpenSupportTicketDto,
    @Req() req: { user?: { id?: string } },
  ) {
    return this.openTicketUseCase.execute({ userId: req.user?.id ?? '', ...dto });
  }

  @Get('tickets')
  @ApiOperation({ summary: 'Mis tickets de soporte' })
  @ApiResponse({ status: 200, type: [SupportTicketResponseDto] })
  async getMyTickets(@Req() req: { user?: { id?: string } }) {
    return this.getMyTicketsUseCase.execute(req.user?.id ?? '');
  }

  @Get('tickets/:id')
  @ApiParam({ name: 'id', description: 'UUID del ticket', type: 'string' })
  @ApiOperation({ summary: 'Detalle de un ticket' })
  @ApiResponse({ status: 200, type: SupportTicketResponseDto })
  @ApiResponse({ status: 404, description: 'Ticket no encontrado.' })
  async getTicket(@Param('id') id: string) {
    return this.updateStatusUseCase.execute({ ticketId: id, agentId: '', action: 'assign' });
  }

  @Patch('tickets/:id/assign')
  @ApiParam({ name: 'id', description: 'UUID del ticket', type: 'string' })
  @ApiOperation({ summary: 'Asignar ticket a un agente (admin)', description: 'Cambia estado a IN_PROGRESS.' })
  @ApiResponse({ status: 200, type: SupportTicketResponseDto })
  @ApiResponse({ status: 404, description: 'Ticket no encontrado.' })
  async assign(
    @Param('id') id: string,
    @Req() req: { user?: { id?: string } },
  ) {
    return this.updateStatusUseCase.execute({ ticketId: id, agentId: req.user?.id ?? '', action: 'assign' });
  }

  @Patch('tickets/:id/resolve')
  @ApiParam({ name: 'id', description: 'UUID del ticket', type: 'string' })
  @ApiOperation({ summary: 'Resolver ticket', description: 'Cambia estado a RESOLVED.' })
  @ApiResponse({ status: 200, type: SupportTicketResponseDto })
  async resolve(
    @Param('id') id: string,
    @Req() req: { user?: { id?: string } },
  ) {
    return this.updateStatusUseCase.execute({ ticketId: id, agentId: req.user?.id ?? '', action: 'resolve' });
  }

  @Patch('tickets/:id/close')
  @ApiParam({ name: 'id', description: 'UUID del ticket', type: 'string' })
  @ApiOperation({ summary: 'Cerrar ticket', description: 'Cambia estado a CLOSED.' })
  @ApiResponse({ status: 200, type: SupportTicketResponseDto })
  async close(
    @Param('id') id: string,
    @Req() req: { user?: { id?: string } },
  ) {
    return this.updateStatusUseCase.execute({ ticketId: id, agentId: req.user?.id ?? '', action: 'close' });
  }
}
