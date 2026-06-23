import { ChatSessionEntity } from '@/modules/chat/domain/entities/chat-session.entity';
import { ChatSessionStatus } from '@/modules/chat/domain/enums/chat-session-status.enum';
import { ChatPhase } from '@/modules/chat/domain/enums/chat-phase.enum';
import { DomainException } from '@/domain/exceptions/domain.exception';

const validProps = {
  tripId: 'trip-1',
  driverId: 'driver-1',
  passengerIds: ['pass-1', 'pass-2'],
};

describe('ChatSessionEntity', () => {
  describe('create()', () => {
    it('should create a session in OPEN status and BOOKING phase by default', () => {
      const session = ChatSessionEntity.create(validProps);

      expect(session.status).toBe(ChatSessionStatus.OPEN);
      expect(session.phase).toBe(ChatPhase.BOOKING);
      expect(session.tripId).toBe('trip-1');
      expect(session.driverId).toBe('driver-1');
      expect(session.passengerIds).toEqual(['pass-1', 'pass-2']);
    });

    it('should throw if tripId is missing', () => {
      expect(() =>
        ChatSessionEntity.create({ ...validProps, tripId: '' }),
      ).toThrow(DomainException);
    });

    it('should throw if driverId is missing', () => {
      expect(() =>
        ChatSessionEntity.create({ ...validProps, driverId: '' }),
      ).toThrow(DomainException);
    });

    it('should generate unique ids', () => {
      const a = ChatSessionEntity.create(validProps);
      const b = ChatSessionEntity.create(validProps);
      expect(a.id).not.toBe(b.id);
    });
  });

  describe('close()', () => {
    it('should transition from OPEN to CLOSED', () => {
      const session = ChatSessionEntity.create(validProps);
      session.close();
      expect(session.status).toBe(ChatSessionStatus.CLOSED);
    });

    it('should throw if already closed', () => {
      const session = ChatSessionEntity.create(validProps);
      session.close();
      expect(() => session.close()).toThrow(DomainException);
    });
  });

  describe('transitionToRoute()', () => {
    it('should change phase to IN_ROUTE', () => {
      const session = ChatSessionEntity.create(validProps);
      session.transitionToRoute();
      expect(session.phase).toBe(ChatPhase.IN_ROUTE);
    });

    it('should remain OPEN after transition', () => {
      const session = ChatSessionEntity.create(validProps);
      session.transitionToRoute();
      expect(session.status).toBe(ChatSessionStatus.OPEN);
    });
  });

  describe('canSendMessages()', () => {
    it('should return true when OPEN', () => {
      const session = ChatSessionEntity.create(validProps);
      expect(session.canSendMessages()).toBe(true);
    });

    it('should return false when CLOSED', () => {
      const session = ChatSessionEntity.create(validProps);
      session.close();
      expect(session.canSendMessages()).toBe(false);
    });
  });

  describe('isParticipant()', () => {
    it('should return true for the driver', () => {
      const session = ChatSessionEntity.create(validProps);
      expect(session.isParticipant('driver-1')).toBe(true);
    });

    it('should return true for a listed passenger', () => {
      const session = ChatSessionEntity.create(validProps);
      expect(session.isParticipant('pass-1')).toBe(true);
    });

    it('should return false for an unknown user', () => {
      const session = ChatSessionEntity.create(validProps);
      expect(session.isParticipant('stranger')).toBe(false);
    });
  });

  describe('addPassenger()', () => {
    it('should add a new passenger', () => {
      const session = ChatSessionEntity.create({
        ...validProps,
        passengerIds: ['pass-1'],
      });
      session.addPassenger('pass-2');
      expect(session.passengerIds).toContain('pass-2');
    });

    it('should not add a duplicate passenger', () => {
      const session = ChatSessionEntity.create({
        ...validProps,
        passengerIds: ['pass-1'],
      });
      session.addPassenger('pass-1');
      expect(
        session.passengerIds.filter((id) => id === 'pass-1'),
      ).toHaveLength(1);
    });
  });
});
