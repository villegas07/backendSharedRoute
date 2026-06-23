import { BaseEntity } from '../../../../domain/entities/base.entity';
import { MessageType } from '../enums/message-type.enum';
import { SenderRole } from '../enums/sender-role.enum';

export interface ChatMessageProps {
  id?: string;
  tripId: string;
  senderId: string;
  senderRole: SenderRole;
  content: string;
  messageType: MessageType;
  imageUrl?: string;
}

export class ChatMessageEntity extends BaseEntity {
  readonly tripId: string;
  readonly senderId: string;
  readonly senderRole: SenderRole;
  readonly content: string;
  readonly messageType: MessageType;
  readonly imageUrl?: string;
  readonly sentAt: Date;

  private constructor(props: ChatMessageProps) {
    super(props.id);
    this.tripId = props.tripId;
    this.senderId = props.senderId;
    this.senderRole = props.senderRole;
    this.content = props.content;
    this.messageType = props.messageType;
    this.imageUrl = props.imageUrl;
    this.sentAt = new Date();
  }

  static create(props: ChatMessageProps): ChatMessageEntity {
    return new ChatMessageEntity(props);
  }

  isImage(): boolean {
    return this.messageType === MessageType.IMAGE;
  }
}
