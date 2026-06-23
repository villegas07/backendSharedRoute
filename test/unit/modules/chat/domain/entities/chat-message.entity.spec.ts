import { ChatMessageEntity } from '@/modules/chat/domain/entities/chat-message.entity';
import { MessageType } from '@/modules/chat/domain/enums/message-type.enum';
import { SenderRole } from '@/modules/chat/domain/enums/sender-role.enum';

const textProps = {
  tripId: 'trip-1',
  senderId: 'driver-1',
  senderRole: SenderRole.DRIVER,
  content: 'Hola, estoy en camino',
  messageType: MessageType.TEXT,
};

describe('ChatMessageEntity', () => {
  describe('create()', () => {
    it('should create a text message with correct properties', () => {
      const msg = ChatMessageEntity.create(textProps);

      expect(msg.id).toBeDefined();
      expect(msg.tripId).toBe('trip-1');
      expect(msg.senderId).toBe('driver-1');
      expect(msg.senderRole).toBe(SenderRole.DRIVER);
      expect(msg.content).toBe('Hola, estoy en camino');
      expect(msg.messageType).toBe(MessageType.TEXT);
      expect(msg.sentAt).toBeInstanceOf(Date);
    });

    it('should create an image message with imageUrl', () => {
      const msg = ChatMessageEntity.create({
        ...textProps,
        content: 'foto.jpg',
        messageType: MessageType.IMAGE,
        imageUrl: 'uploads/chat/trip-1/uuid.jpg',
      });

      expect(msg.messageType).toBe(MessageType.IMAGE);
      expect(msg.imageUrl).toBe('uploads/chat/trip-1/uuid.jpg');
    });

    it('should create with PASSENGER role', () => {
      const msg = ChatMessageEntity.create({
        ...textProps,
        senderId: 'pass-1',
        senderRole: SenderRole.PASSENGER,
      });

      expect(msg.senderRole).toBe(SenderRole.PASSENGER);
    });

    it('should generate a unique id for each message', () => {
      const msg1 = ChatMessageEntity.create(textProps);
      const msg2 = ChatMessageEntity.create(textProps);

      expect(msg1.id).not.toBe(msg2.id);
    });
  });

  describe('isImage()', () => {
    it('should return false for TEXT messages', () => {
      const msg = ChatMessageEntity.create(textProps);
      expect(msg.isImage()).toBe(false);
    });

    it('should return true for IMAGE messages', () => {
      const msg = ChatMessageEntity.create({
        ...textProps,
        messageType: MessageType.IMAGE,
        imageUrl: 'uploads/chat/trip-1/uuid.jpg',
      });
      expect(msg.isImage()).toBe(true);
    });
  });
});
