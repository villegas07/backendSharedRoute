import { Module } from '@nestjs/common';
import { ChatSessionRepository } from './domain/ports/chat-session.repository';
import { ChatMessageRepository } from './domain/ports/chat-message.repository';
import { InMemoryChatSessionStore } from './infrastructure/stores/in-memory-chat-session.store';
import { InMemoryChatMessageStore } from './infrastructure/stores/in-memory-chat-message.store';
import { OpenChatSessionUseCase } from './application/use-cases/open-chat-session.use-case';
import { CloseChatSessionUseCase } from './application/use-cases/close-chat-session.use-case';
import { SendMessageUseCase } from './application/use-cases/send-message.use-case';
import { SendImageMessageUseCase } from './application/use-cases/send-image-message.use-case';
import { GetChatHistoryUseCase } from './application/use-cases/get-chat-history.use-case';
import { ChatGateway } from './presentation/gateways/chat.gateway';
import { ChatController } from './presentation/controllers/chat.controller';
import { FileStorageService } from '../../shared/storage/file-storage.service';
import { LocalFileStorageService } from '../../shared/storage/local-file-storage.service';

@Module({
  controllers: [ChatController],
  providers: [
    { provide: ChatSessionRepository, useClass: InMemoryChatSessionStore },
    { provide: ChatMessageRepository, useClass: InMemoryChatMessageStore },
    { provide: FileStorageService, useClass: LocalFileStorageService },
    OpenChatSessionUseCase,
    CloseChatSessionUseCase,
    SendMessageUseCase,
    SendImageMessageUseCase,
    GetChatHistoryUseCase,
    ChatGateway,
  ],
  exports: [ChatGateway, OpenChatSessionUseCase, CloseChatSessionUseCase],
})
export class ChatModule {}
