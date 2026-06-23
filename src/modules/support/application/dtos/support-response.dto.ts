import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SupportCategory } from '../../domain/enums/support-category.enum';
import { SupportTicketStatus } from '../../domain/enums/support-ticket-status.enum';
import { SupportPriority } from '../../domain/enums/support-priority.enum';

export class SupportTicketResponseDto {
  @ApiProperty({ example: 'uuid-v4' })
  id: string;

  @ApiProperty({ example: 'user-uuid' })
  userId: string;

  @ApiProperty({ enum: SupportCategory })
  category: SupportCategory;

  @ApiProperty({ example: 'Conductor con comportamiento inapropiado' })
  subject: string;

  @ApiProperty({ example: 'El conductor tomó rutas incorrectas...' })
  description: string;

  @ApiPropertyOptional({ example: 'trip-uuid' })
  relatedTripId?: string;

  @ApiPropertyOptional({ example: 'driver-uuid' })
  relatedUserId?: string;

  @ApiProperty({ enum: SupportPriority })
  priority: SupportPriority;

  @ApiProperty({ enum: SupportTicketStatus })
  status: SupportTicketStatus;

  @ApiPropertyOptional({ example: 'agent-uuid' })
  assignedToId?: string;

  @ApiPropertyOptional({ example: 'chat-session-uuid' })
  chatSessionId?: string;

  @ApiPropertyOptional()
  resolvedAt?: Date;

  @ApiProperty()
  createdAt: Date;
}

export class OpenSupportTicketResponseDto {
  @ApiProperty({ type: SupportTicketResponseDto })
  ticket: SupportTicketResponseDto;

  @ApiProperty({ example: 'chat-session-uuid' })
  chatSessionId: string;

  @ApiProperty({ example: 'chat:support-ticket-uuid', description: 'Room ID para unirse al WebSocket de chat' })
  chatRoomId: string;
}
