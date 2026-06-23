import { EmergencyContactEntity } from '../entities/emergency-contact.entity';

export abstract class EmergencyContactRepository {
  abstract save(contact: EmergencyContactEntity): Promise<void>;
  abstract findById(id: string): Promise<EmergencyContactEntity | null>;
  abstract findByUserId(userId: string): Promise<EmergencyContactEntity[]>;
  abstract countByUserId(userId: string): Promise<number>;
  abstract delete(id: string): Promise<void>;
}
