import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../../application/use-cases/use-case.interface';
import { SupportTicketRepository } from '../../domain/ports/support-ticket.repository';
import { SupportTicketEntity } from '../../domain/entities/support-ticket.entity';
import { SupportCategory } from '../../domain/enums/support-category.enum';
import { SupportPriority } from '../../domain/enums/support-priority.enum';
import { OpenChatSessionUseCase } from '../../../chat/application/use-cases/open-chat-session.use-case';
import { ChatPhase } from '../../../chat/domain/enums/chat-phase.enum';

export interface OpenSupportTicketInput {
  userId: string;
  category: SupportCategory;
  subject: string;
  description: string;
  relatedTripId?: string;
  relatedUserId?: string;
  priority?: SupportPriority;
}

export interface OpenSupportTicketResult {
  ticket: SupportTicketEntity;
  chatSessionId: string;
  chatRoomId: string;
}

@Injectable()
export class OpenSupportTicketUseCase
  implements UseCase<OpenSupportTicketInput, OpenSupportTicketResult>
{
  constructor(
    private readonly ticketRepo: SupportTicketRepository,
    private readonly openChatSession: OpenChatSessionUseCase,
  ) {}

  async execute(input: OpenSupportTicketInput): Promise<OpenSupportTicketResult> {
    const ticket = SupportTicketEntity.create({
      userId: input.userId,
      category: input.category,
      subject: input.subject,
      description: input.description,
      relatedTripId: input.relatedTripId,
      relatedUserId: input.relatedUserId,
      priority: input.priority,
    });

    const supportTripId = `support-${ticket.id}`;

    const chatSession = await this.openChatSession.execute({
      tripId: supportTripId,
      driverId: input.userId,
      passengerIds: [],
      phase: ChatPhase.SUPPORT,
    });

    ticket.linkChatSession(chatSession.id);
    await this.ticketRepo.save(ticket);

    return {
      ticket,
      chatSessionId: chatSession.id,
      chatRoomId: `chat:${supportTripId}`,
    };
  }
}
