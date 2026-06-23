import { SupportTicketEntity } from '../entities/support-ticket.entity';

export abstract class SupportTicketRepository {
  abstract save(ticket: SupportTicketEntity): Promise<void>;
  abstract findById(id: string): Promise<SupportTicketEntity | null>;
  abstract findByUserId(userId: string): Promise<SupportTicketEntity[]>;
  abstract findAllOpen(): Promise<SupportTicketEntity[]>;
}
