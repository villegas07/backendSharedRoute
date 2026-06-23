import { Injectable } from '@nestjs/common';
import { EmergencyContactRepository } from '../../domain/ports/emergency-contact.repository';
import { EmergencyContactEntity } from '../../domain/entities/emergency-contact.entity';

@Injectable()
export class InMemoryEmergencyContactStore extends EmergencyContactRepository {
  private readonly contacts = new Map<string, EmergencyContactEntity>();

  async save(contact: EmergencyContactEntity): Promise<void> {
    this.contacts.set(contact.id, contact);
  }

  async findById(id: string): Promise<EmergencyContactEntity | null> {
    return this.contacts.get(id) ?? null;
  }

  async findByUserId(userId: string): Promise<EmergencyContactEntity[]> {
    return [...this.contacts.values()].filter((c) => c.userId === userId);
  }

  async countByUserId(userId: string): Promise<number> {
    return [...this.contacts.values()].filter((c) => c.userId === userId)
      .length;
  }

  async delete(id: string): Promise<void> {
    this.contacts.delete(id);
  }
}
