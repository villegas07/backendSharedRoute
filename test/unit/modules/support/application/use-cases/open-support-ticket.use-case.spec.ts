import { OpenSupportTicketUseCase } from '@/modules/support/application/use-cases/open-support-ticket.use-case';
import { SupportTicketRepository } from '@/modules/support/domain/ports/support-ticket.repository';
import { OpenChatSessionUseCase } from '@/modules/chat/application/use-cases/open-chat-session.use-case';
import { ChatSessionEntity } from '@/modules/chat/domain/entities/chat-session.entity';
import { ChatPhase } from '@/modules/chat/domain/enums/chat-phase.enum';
import { SupportCategory } from '@/modules/support/domain/enums/support-category.enum';
import { SupportTicketStatus } from '@/modules/support/domain/enums/support-ticket-status.enum';
import { SupportPriority } from '@/modules/support/domain/enums/support-priority.enum';

const makeMockTicketRepo = (): jest.Mocked<SupportTicketRepository> => ({
  save: jest.fn(),
  findById: jest.fn(),
  findByUserId: jest.fn(),
  findAllOpen: jest.fn(),
} as jest.Mocked<SupportTicketRepository>);

const mockChatSession = ChatSessionEntity.create({
  tripId: 'support-ticket-abc',
  driverId: 'user-1',
  passengerIds: [],
  phase: ChatPhase.SUPPORT,
});

const baseInput = {
  userId: 'user-1',
  category: SupportCategory.DRIVER_REPORT,
  subject: 'Conductor irresponsable',
  description: 'El conductor tomó rutas incorrectas y me faltó el respeto.',
  relatedTripId: 'trip-1',
};

describe('OpenSupportTicketUseCase', () => {
  let useCase: OpenSupportTicketUseCase;
  let ticketRepo: jest.Mocked<SupportTicketRepository>;
  let openChatSession: jest.Mocked<OpenChatSessionUseCase>;

  beforeEach(() => {
    ticketRepo = makeMockTicketRepo();
    openChatSession = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<OpenChatSessionUseCase>;

    useCase = new OpenSupportTicketUseCase(ticketRepo, openChatSession);
  });

  it('should create a ticket and open a support chat session', async () => {
    openChatSession.execute.mockResolvedValue(mockChatSession);

    const result = await useCase.execute(baseInput);

    expect(result.ticket.userId).toBe('user-1');
    expect(result.ticket.status).toBe(SupportTicketStatus.OPEN);
    expect(result.ticket.category).toBe(SupportCategory.DRIVER_REPORT);
    expect(result.chatSessionId).toBeDefined();
    expect(result.chatRoomId).toContain('support-');
    expect(ticketRepo.save).toHaveBeenCalled();
  });

  it('should open chat with SUPPORT phase', async () => {
    openChatSession.execute.mockResolvedValue(mockChatSession);

    await useCase.execute(baseInput);

    expect(openChatSession.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        phase: ChatPhase.SUPPORT,
      }),
    );
  });

  it('should link chat session id to ticket', async () => {
    openChatSession.execute.mockResolvedValue(mockChatSession);

    const result = await useCase.execute(baseInput);

    expect(result.ticket.chatSessionId).toBe(mockChatSession.id);
  });

  it('should use tripId = "support-{ticketId}" for chat session', async () => {
    openChatSession.execute.mockResolvedValue(mockChatSession);

    const result = await useCase.execute(baseInput);

    expect(openChatSession.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        tripId: `support-${result.ticket.id}`,
      }),
    );
  });

  it('should set CRITICAL priority when provided', async () => {
    openChatSession.execute.mockResolvedValue(mockChatSession);

    const result = await useCase.execute({
      ...baseInput,
      priority: SupportPriority.CRITICAL,
    });

    expect(result.ticket.priority).toBe(SupportPriority.CRITICAL);
  });

  it('should work for APP_BUG category without relatedTripId', async () => {
    openChatSession.execute.mockResolvedValue(mockChatSession);

    const result = await useCase.execute({
      userId: 'user-2',
      category: SupportCategory.APP_BUG,
      subject: 'App crashes on login',
      description: 'Every time I try to login, the app crashes immediately.',
    });

    expect(result.ticket.category).toBe(SupportCategory.APP_BUG);
    expect(result.ticket.relatedTripId).toBeUndefined();
  });

  it('should include chatRoomId formatted as "chat:support-{ticketId}"', async () => {
    openChatSession.execute.mockResolvedValue(mockChatSession);

    const result = await useCase.execute(baseInput);

    expect(result.chatRoomId).toBe(`chat:support-${result.ticket.id}`);
  });
});
