import { GetMyTicketsUseCase } from '@/modules/support/application/use-cases/get-my-tickets.use-case';
import { UpdateTicketStatusUseCase } from '@/modules/support/application/use-cases/update-ticket-status.use-case';
import { SupportTicketRepository } from '@/modules/support/domain/ports/support-ticket.repository';
import { SupportTicketEntity } from '@/modules/support/domain/entities/support-ticket.entity';
import { SupportCategory } from '@/modules/support/domain/enums/support-category.enum';
import { SupportTicketStatus } from '@/modules/support/domain/enums/support-ticket-status.enum';
import { NotFoundException } from '@nestjs/common';

const makeMockRepo = (): jest.Mocked<SupportTicketRepository> => ({
  save: jest.fn(),
  findById: jest.fn(),
  findByUserId: jest.fn(),
  findAllOpen: jest.fn(),
} as jest.Mocked<SupportTicketRepository>);

const makeTicket = () =>
  SupportTicketEntity.create({
    userId: 'user-1',
    category: SupportCategory.GENERAL,
    subject: 'Consulta general sobre la app',
    description: 'Tengo una consulta sobre cómo funciona la app.',
  });

describe('GetMyTicketsUseCase', () => {
  let useCase: GetMyTicketsUseCase;
  let repo: jest.Mocked<SupportTicketRepository>;

  beforeEach(() => {
    repo = makeMockRepo();
    useCase = new GetMyTicketsUseCase(repo);
  });

  it('should return all tickets for a user', async () => {
    const tickets = [makeTicket(), makeTicket()];
    repo.findByUserId.mockResolvedValue(tickets);

    const result = await useCase.execute('user-1');

    expect(result).toHaveLength(2);
    expect(repo.findByUserId).toHaveBeenCalledWith('user-1');
  });

  it('should return empty array when user has no tickets', async () => {
    repo.findByUserId.mockResolvedValue([]);
    const result = await useCase.execute('user-1');
    expect(result).toEqual([]);
  });
});

describe('UpdateTicketStatusUseCase', () => {
  let useCase: UpdateTicketStatusUseCase;
  let repo: jest.Mocked<SupportTicketRepository>;

  beforeEach(() => {
    repo = makeMockRepo();
    useCase = new UpdateTicketStatusUseCase(repo);
  });

  it('should assign ticket to an agent', async () => {
    const ticket = makeTicket();
    repo.findById.mockResolvedValue(ticket);

    const result = await useCase.execute({
      ticketId: ticket.id,
      agentId: 'agent-1',
      action: 'assign',
    });

    expect(result.status).toBe(SupportTicketStatus.IN_PROGRESS);
    expect(result.assignedToId).toBe('agent-1');
    expect(repo.save).toHaveBeenCalled();
  });

  it('should resolve a ticket', async () => {
    const ticket = makeTicket();
    repo.findById.mockResolvedValue(ticket);

    const result = await useCase.execute({
      ticketId: ticket.id,
      agentId: 'agent-1',
      action: 'resolve',
    });

    expect(result.status).toBe(SupportTicketStatus.RESOLVED);
    expect(result.resolvedAt).toBeInstanceOf(Date);
  });

  it('should close a ticket', async () => {
    const ticket = makeTicket();
    repo.findById.mockResolvedValue(ticket);

    const result = await useCase.execute({
      ticketId: ticket.id,
      agentId: 'agent-1',
      action: 'close',
    });

    expect(result.status).toBe(SupportTicketStatus.CLOSED);
  });

  it('should throw NotFoundException when ticket not found', async () => {
    repo.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({ ticketId: 'nonexistent', agentId: 'agent-1', action: 'assign' }),
    ).rejects.toThrow(NotFoundException);
  });
});
