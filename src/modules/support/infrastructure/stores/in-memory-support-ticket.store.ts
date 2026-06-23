import { Injectable } from '@nestjs/common';
import { SupportTicketRepository } from '../../domain/ports/support-ticket.repository';
import { SupportTicketEntity } from '../../domain/entities/support-ticket.entity';

@Injectable()
export class InMemorySupportTicketStore extends SupportTicketRepository {
  private readonly tickets = new Map<string, SupportTicketEntity>();

  async save(ticket: SupportTicketEntity): Promise<void> {
    this.tickets.set(ticket.id, ticket);
  }

  async findById(id: string): Promise<SupportTicketEntity | null> {
    return this.tickets.get(id) ?? null;
  }

  async findByUserId(userId: string): Promise<SupportTicketEntity[]> {
    return [...this.tickets.values()].filter((t) => t.userId === userId);
  }

  async findAllOpen(): Promise<SupportTicketEntity[]> {
    return [...this.tickets.values()].filter((t) => t.isOpen());
  }
}
