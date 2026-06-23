import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../../application/use-cases/use-case.interface';
import { ChatSessionRepository } from '../../domain/ports/chat-session.repository';
import { ChatSessionEntity } from '../../domain/entities/chat-session.entity';
import { ChatPhase } from '../../domain/enums/chat-phase.enum';

interface OpenChatSessionInput {
  tripId: string;
  driverId: string;
  passengerIds: string[];
  phase?: ChatPhase;
}

@Injectable()
export class OpenChatSessionUseCase
  implements UseCase<OpenChatSessionInput, ChatSessionEntity>
{
  constructor(private readonly sessionRepo: ChatSessionRepository) {}

  async execute(input: OpenChatSessionInput): Promise<ChatSessionEntity> {
    const existing = await this.sessionRepo.findByTripId(input.tripId);
    if (existing) return existing;

    const session = ChatSessionEntity.create({
      tripId: input.tripId,
      driverId: input.driverId,
      passengerIds: input.passengerIds,
      phase: input.phase ?? ChatPhase.BOOKING,
    });

    await this.sessionRepo.save(session);
    return session;
  }
}
