import { InMemoryChatSessionStore } from '@/modules/chat/infrastructure/stores/in-memory-chat-session.store';
import { InMemoryChatMessageStore } from '@/modules/chat/infrastructure/stores/in-memory-chat-message.store';
import { ChatSessionEntity } from '@/modules/chat/domain/entities/chat-session.entity';
import { ChatMessageEntity } from '@/modules/chat/domain/entities/chat-message.entity';
import { MessageType } from '@/modules/chat/domain/enums/message-type.enum';
import { SenderRole } from '@/modules/chat/domain/enums/sender-role.enum';

const makeSession = (tripId = 'trip-1') =>
  ChatSessionEntity.create({
    tripId,
    driverId: 'driver-1',
    passengerIds: ['pass-1'],
  });

const makeMessage = (tripId = 'trip-1') =>
  ChatMessageEntity.create({
    tripId,
    senderId: 'driver-1',
    senderRole: SenderRole.DRIVER,
    content: 'Hola',
    messageType: MessageType.TEXT,
  });

describe('InMemoryChatSessionStore', () => {
  let store: InMemoryChatSessionStore;

  beforeEach(() => { store = new InMemoryChatSessionStore(); });

  it('should save and find by id', async () => {
    const session = makeSession();
    await store.save(session);
    expect(await store.findById(session.id)).toBe(session);
  });

  it('should return null for unknown id', async () => {
    expect(await store.findById('x')).toBeNull();
  });

  it('should find by tripId', async () => {
    const session = makeSession('trip-2');
    await store.save(session);
    expect(await store.findByTripId('trip-2')).toBe(session);
  });

  it('should return null for unknown tripId', async () => {
    expect(await store.findByTripId('unknown')).toBeNull();
  });

  it('should delete a session', async () => {
    const session = makeSession();
    await store.save(session);
    await store.delete(session.id);
    expect(await store.findById(session.id)).toBeNull();
  });

  it('should overwrite session on re-save', async () => {
    const session = makeSession();
    await store.save(session);
    session.close();
    await store.save(session);
    const found = await store.findById(session.id);
    expect(found?.status).toBe(session.status);
  });
});

describe('InMemoryChatMessageStore', () => {
  let store: InMemoryChatMessageStore;

  beforeEach(() => { store = new InMemoryChatMessageStore(); });

  it('should save messages', async () => {
    const msg = makeMessage();
    await store.save(msg);
    const result = await store.findByTripId('trip-1', 50, 0);
    expect(result).toHaveLength(1);
  });

  it('should filter by tripId', async () => {
    await store.save(makeMessage('trip-1'));
    await store.save(makeMessage('trip-2'));
    const result = await store.findByTripId('trip-1', 50, 0);
    expect(result).toHaveLength(1);
    expect(result[0].tripId).toBe('trip-1');
  });

  it('should respect limit and offset pagination', async () => {
    for (let i = 0; i < 5; i++) await store.save(makeMessage());
    const page1 = await store.findByTripId('trip-1', 3, 0);
    const page2 = await store.findByTripId('trip-1', 3, 3);
    expect(page1).toHaveLength(3);
    expect(page2).toHaveLength(2);
  });

  it('should count messages by tripId', async () => {
    await store.save(makeMessage('trip-1'));
    await store.save(makeMessage('trip-1'));
    await store.save(makeMessage('trip-2'));
    expect(await store.countByTripId('trip-1')).toBe(2);
    expect(await store.countByTripId('trip-2')).toBe(1);
  });

  it('should return messages sorted by sentAt', async () => {
    const msg1 = makeMessage();
    await new Promise((r) => setTimeout(r, 5));
    const msg2 = makeMessage();
    await store.save(msg2);
    await store.save(msg1);
    const result = await store.findByTripId('trip-1', 10, 0);
    expect(result[0].sentAt.getTime()).toBeLessThanOrEqual(
      result[1].sentAt.getTime(),
    );
  });
});
