import { BaseEntity } from '../../../../domain/entities/base.entity';
import { DomainException } from '../../../../domain/exceptions/domain.exception';
import { ChatSessionStatus } from '../enums/chat-session-status.enum';
import { ChatPhase } from '../enums/chat-phase.enum';

export interface ChatSessionProps {
  id?: string;
  tripId: string;
  driverId: string;
  passengerIds: string[];
  phase?: ChatPhase;
  status?: ChatSessionStatus;
}

export class ChatSessionEntity extends BaseEntity {
  readonly tripId: string;
  readonly driverId: string;
  readonly passengerIds: string[];
  phase: ChatPhase;
  status: ChatSessionStatus;

  private constructor(props: ChatSessionProps) {
    super(props.id);
    this.tripId = props.tripId;
    this.driverId = props.driverId;
    this.passengerIds = [...props.passengerIds];
    this.phase = props.phase ?? ChatPhase.BOOKING;
    this.status = props.status ?? ChatSessionStatus.OPEN;
  }

  static create(props: ChatSessionProps): ChatSessionEntity {
    if (!props.tripId) {
      throw new DomainException('Trip ID is required', 'MISSING_TRIP_ID');
    }
    if (!props.driverId) {
      throw new DomainException('Driver ID is required', 'MISSING_DRIVER_ID');
    }
    return new ChatSessionEntity(props);
  }

  close(): void {
    if (this.status === ChatSessionStatus.CLOSED) {
      throw new DomainException(
        'Chat session is already closed',
        'CHAT_ALREADY_CLOSED',
      );
    }
    this.status = ChatSessionStatus.CLOSED;
    this.touch();
  }

  transitionToRoute(): void {
    this.phase = ChatPhase.IN_ROUTE;
    this.touch();
  }

  canSendMessages(): boolean {
    return this.status === ChatSessionStatus.OPEN;
  }

  isParticipant(userId: string): boolean {
    return this.driverId === userId || this.passengerIds.includes(userId);
  }

  addPassenger(passengerId: string): void {
    if (!this.passengerIds.includes(passengerId)) {
      this.passengerIds.push(passengerId);
      this.touch();
    }
  }
}
