import { Module } from '@nestjs/common';
import { ChatModule } from '../chat/chat.module';
import { SupportTicketRepository } from './domain/ports/support-ticket.repository';
import { InMemorySupportTicketStore } from './infrastructure/stores/in-memory-support-ticket.store';
import { OpenSupportTicketUseCase } from './application/use-cases/open-support-ticket.use-case';
import { GetMyTicketsUseCase } from './application/use-cases/get-my-tickets.use-case';
import { UpdateTicketStatusUseCase } from './application/use-cases/update-ticket-status.use-case';
import { SupportController } from './presentation/controllers/support.controller';

@Module({
  imports: [ChatModule],
  controllers: [SupportController],
  providers: [
    { provide: SupportTicketRepository, useClass: InMemorySupportTicketStore },
    OpenSupportTicketUseCase,
    GetMyTicketsUseCase,
    UpdateTicketStatusUseCase,
  ],
  exports: [SupportTicketRepository],
})
export class SupportModule {}
