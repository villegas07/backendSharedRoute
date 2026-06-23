import { SupportTicketEntity } from '@/modules/support/domain/entities/support-ticket.entity';
import { SupportCategory } from '@/modules/support/domain/enums/support-category.enum';
import { SupportTicketStatus } from '@/modules/support/domain/enums/support-ticket-status.enum';
import { SupportPriority } from '@/modules/support/domain/enums/support-priority.enum';
import { DomainException } from '@/domain/exceptions/domain.exception';

const validProps = {
  userId: 'user-1',
  category: SupportCategory.DRIVER_REPORT,
  subject: 'Conductor irresponsable',
  description: 'El conductor tomó rutas incorrectas y me faltó el respeto.',
  relatedTripId: 'trip-1',
};

describe('SupportTicketEntity', () => {
  describe('create()', () => {
    it('should create a ticket with OPEN status and MEDIUM priority by default', () => {
      const ticket = SupportTicketEntity.create(validProps);

      expect(ticket.id).toBeDefined();
      expect(ticket.userId).toBe('user-1');
      expect(ticket.status).toBe(SupportTicketStatus.OPEN);
      expect(ticket.priority).toBe(SupportPriority.MEDIUM);
      expect(ticket.category).toBe(SupportCategory.DRIVER_REPORT);
      expect(ticket.subject).toBe('Conductor irresponsable');
      expect(ticket.chatSessionId).toBeUndefined();
    });

    it('should create tickets for all categories', () => {
      for (const category of Object.values(SupportCategory)) {
        const t = SupportTicketEntity.create({ ...validProps, category });
        expect(t.category).toBe(category);
      }
    });

    it('should respect custom priority', () => {
      const t = SupportTicketEntity.create({
        ...validProps,
        priority: SupportPriority.CRITICAL,
      });
      expect(t.priority).toBe(SupportPriority.CRITICAL);
    });

    it('should create without relatedTripId (optional)', () => {
      const t = SupportTicketEntity.create({
        ...validProps,
        relatedTripId: undefined,
      });
      expect(t.relatedTripId).toBeUndefined();
    });

    // RED — require validation
    it('should throw DomainException if userId is empty', () => {
      expect(() =>
        SupportTicketEntity.create({ ...validProps, userId: '' }),
      ).toThrow(DomainException);
    });

    it('should throw DomainException if subject is too short (< 5 chars)', () => {
      expect(() =>
        SupportTicketEntity.create({ ...validProps, subject: 'Bug' }),
      ).toThrow(DomainException);
    });

    it('should throw DomainException if description is too short (< 10 chars)', () => {
      expect(() =>
        SupportTicketEntity.create({ ...validProps, description: 'Short' }),
      ).toThrow(DomainException);
    });

    it('should throw DomainException if description exceeds 1000 chars', () => {
      expect(() =>
        SupportTicketEntity.create({ ...validProps, description: 'a'.repeat(1001) }),
      ).toThrow(DomainException);
    });

    it('should generate unique ids', () => {
      const t1 = SupportTicketEntity.create(validProps);
      const t2 = SupportTicketEntity.create(validProps);
      expect(t1.id).not.toBe(t2.id);
    });
  });

  describe('linkChatSession()', () => {
    it('should set chatSessionId', () => {
      const t = SupportTicketEntity.create(validProps);
      t.linkChatSession('chat-session-abc');
      expect(t.chatSessionId).toBe('chat-session-abc');
    });
  });

  describe('assignTo()', () => {
    it('should transition OPEN → IN_PROGRESS and set assignedToId', () => {
      const t = SupportTicketEntity.create(validProps);
      t.assignTo('agent-1');
      expect(t.status).toBe(SupportTicketStatus.IN_PROGRESS);
      expect(t.assignedToId).toBe('agent-1');
    });

    it('should throw DomainException if already RESOLVED', () => {
      const t = SupportTicketEntity.create(validProps);
      t.assignTo('agent-1');
      t.resolve();
      expect(() => t.assignTo('agent-2')).toThrow(DomainException);
    });

    it('should throw DomainException if already CLOSED', () => {
      const t = SupportTicketEntity.create(validProps);
      t.close();
      expect(() => t.assignTo('agent-1')).toThrow(DomainException);
    });
  });

  describe('resolve()', () => {
    it('should transition IN_PROGRESS → RESOLVED and set resolvedAt', () => {
      const t = SupportTicketEntity.create(validProps);
      t.assignTo('agent-1');
      t.resolve();
      expect(t.status).toBe(SupportTicketStatus.RESOLVED);
      expect(t.resolvedAt).toBeInstanceOf(Date);
    });

    it('should allow resolving from OPEN directly', () => {
      const t = SupportTicketEntity.create(validProps);
      t.resolve();
      expect(t.status).toBe(SupportTicketStatus.RESOLVED);
    });

    it('should throw DomainException if already RESOLVED', () => {
      const t = SupportTicketEntity.create(validProps);
      t.resolve();
      expect(() => t.resolve()).toThrow(DomainException);
    });

    it('should throw DomainException if CLOSED', () => {
      const t = SupportTicketEntity.create(validProps);
      t.close();
      expect(() => t.resolve()).toThrow(DomainException);
    });
  });

  describe('close()', () => {
    it('should transition any open state → CLOSED', () => {
      const t = SupportTicketEntity.create(validProps);
      t.close();
      expect(t.status).toBe(SupportTicketStatus.CLOSED);
    });

    it('should allow closing a RESOLVED ticket', () => {
      const t = SupportTicketEntity.create(validProps);
      t.resolve();
      t.close();
      expect(t.status).toBe(SupportTicketStatus.CLOSED);
    });

    it('should throw DomainException if already CLOSED', () => {
      const t = SupportTicketEntity.create(validProps);
      t.close();
      expect(() => t.close()).toThrow(DomainException);
    });
  });

  describe('isOpen()', () => {
    it('should return true for OPEN', () => {
      const t = SupportTicketEntity.create(validProps);
      expect(t.isOpen()).toBe(true);
    });

    it('should return true for IN_PROGRESS', () => {
      const t = SupportTicketEntity.create(validProps);
      t.assignTo('agent-1');
      expect(t.isOpen()).toBe(true);
    });

    it('should return false for RESOLVED', () => {
      const t = SupportTicketEntity.create(validProps);
      t.resolve();
      expect(t.isOpen()).toBe(false);
    });

    it('should return false for CLOSED', () => {
      const t = SupportTicketEntity.create(validProps);
      t.close();
      expect(t.isOpen()).toBe(false);
    });
  });
});
