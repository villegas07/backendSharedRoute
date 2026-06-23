import { Injectable, NotFoundException } from '@nestjs/common';
import { UseCase } from '../../../../application/use-cases/use-case.interface';
import { SupportTicketRepository } from '../../domain/ports/support-ticket.repository';
import { SupportTicketEntity } from '../../domain/entities/support-ticket.entity';

interface UpdateTicketStatusInput {
  ticketId: string;
  agentId: string;
  action: 'assign' | 'resolve' | 'close';
}

@Injectable()
export class UpdateTicketStatusUseCase
  implements UseCase<UpdateTicketStatusInput, SupportTicketEntity>
{
  constructor(private readonly ticketRepo: SupportTicketRepository) {}

  async execute(input: UpdateTicketStatusInput): Promise<SupportTicketEntity> {
    const ticket = await this.ticketRepo.findById(input.ticketId);
    if (!ticket) {
      throw new NotFoundException('Ticket de soporte no encontrado');
    }

    if (input.action === 'assign') ticket.assignTo(input.agentId);
    if (input.action === 'resolve') ticket.resolve();
    if (input.action === 'close') ticket.close();

    await this.ticketRepo.save(ticket);
    return ticket;
  }
}
