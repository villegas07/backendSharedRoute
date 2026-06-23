import { BaseEntity } from '../../../../domain/entities/base.entity';
import { DomainException } from '../../../../domain/exceptions/domain.exception';
import { SupportCategory } from '../enums/support-category.enum';
import { SupportTicketStatus } from '../enums/support-ticket-status.enum';
import { SupportPriority } from '../enums/support-priority.enum';

export interface SupportTicketProps {
  id?: string;
  userId: string;
  category: SupportCategory;
  subject: string;
  description: string;
  relatedTripId?: string;
  relatedUserId?: string;
  priority?: SupportPriority;
  status?: SupportTicketStatus;
  assignedToId?: string;
  chatSessionId?: string;
}

const ACTIVE_STATUSES = [
  SupportTicketStatus.OPEN,
  SupportTicketStatus.IN_PROGRESS,
];

export class SupportTicketEntity extends BaseEntity {
  readonly userId: string;
  readonly category: SupportCategory;
  readonly subject: string;
  readonly description: string;
  readonly relatedTripId?: string;
  readonly relatedUserId?: string;
  priority: SupportPriority;
  status: SupportTicketStatus;
  assignedToId?: string;
  chatSessionId?: string;
  resolvedAt?: Date;

  private constructor(props: SupportTicketProps) {
    super(props.id);
    this.userId = props.userId;
    this.category = props.category;
    this.subject = props.subject;
    this.description = props.description;
    this.relatedTripId = props.relatedTripId;
    this.relatedUserId = props.relatedUserId;
    this.priority = props.priority ?? SupportPriority.MEDIUM;
    this.status = props.status ?? SupportTicketStatus.OPEN;
    this.assignedToId = props.assignedToId;
    this.chatSessionId = props.chatSessionId;
  }

  static create(props: SupportTicketProps): SupportTicketEntity {
    SupportTicketEntity.validate(props);
    return new SupportTicketEntity(props);
  }

  linkChatSession(chatSessionId: string): void {
    this.chatSessionId = chatSessionId;
  }

  assignTo(agentId: string): void {
    if (!this.isOpen()) {
      throw new DomainException(
        'Only open tickets can be assigned',
        'TICKET_NOT_OPEN',
      );
    }
    this.status = SupportTicketStatus.IN_PROGRESS;
    this.assignedToId = agentId;
    this.touch();
  }

  resolve(): void {
    if (this.status === SupportTicketStatus.RESOLVED) {
      throw new DomainException('Ticket is already resolved', 'TICKET_ALREADY_RESOLVED');
    }
    if (this.status === SupportTicketStatus.CLOSED) {
      throw new DomainException('Cannot resolve a closed ticket', 'TICKET_CLOSED');
    }
    this.status = SupportTicketStatus.RESOLVED;
    this.resolvedAt = new Date();
    this.touch();
  }

  close(): void {
    if (this.status === SupportTicketStatus.CLOSED) {
      throw new DomainException('Ticket is already closed', 'TICKET_ALREADY_CLOSED');
    }
    this.status = SupportTicketStatus.CLOSED;
    this.touch();
  }

  isOpen(): boolean {
    return ACTIVE_STATUSES.includes(this.status);
  }

  private static validate(props: SupportTicketProps): void {
    if (!props.userId?.trim()) {
      throw new DomainException('User ID is required', 'MISSING_USER_ID');
    }
    if (!props.subject || props.subject.trim().length < 5) {
      throw new DomainException(
        'Subject must be at least 5 characters',
        'SUBJECT_TOO_SHORT',
      );
    }
    if (!props.description || props.description.trim().length < 10) {
      throw new DomainException(
        'Description must be at least 10 characters',
        'DESCRIPTION_TOO_SHORT',
      );
    }
    if (props.description.length > 1000) {
      throw new DomainException(
        'Description cannot exceed 1000 characters',
        'DESCRIPTION_TOO_LONG',
      );
    }
  }
}
