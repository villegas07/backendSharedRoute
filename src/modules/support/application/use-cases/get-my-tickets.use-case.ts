import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../../application/use-cases/use-case.interface';
import { SupportTicketRepository } from '../../domain/ports/support-ticket.repository';
import { SupportTicketEntity } from '../../domain/entities/support-ticket.entity';

@Injectable()
export class GetMyTicketsUseCase
  implements UseCase<string, SupportTicketEntity[]>
{
  constructor(private readonly ticketRepo: SupportTicketRepository) {}

  async execute(userId: string): Promise<SupportTicketEntity[]> {
    return this.ticketRepo.findByUserId(userId);
  }
}
