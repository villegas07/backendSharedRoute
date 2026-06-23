import { Injectable, NotFoundException } from '@nestjs/common';
import { UseCase } from '../../../../application/use-cases/use-case.interface';
import { EmergencyContactRepository } from '../../domain/ports/emergency-contact.repository';

@Injectable()
export class DeleteEmergencyContactUseCase
  implements UseCase<string, void>
{
  constructor(
    private readonly contactRepo: EmergencyContactRepository,
  ) {}

  async execute(contactId: string): Promise<void> {
    const contact = await this.contactRepo.findById(contactId);
    if (!contact) {
      throw new NotFoundException('Contacto de emergencia no encontrado');
    }
    await this.contactRepo.delete(contactId);
  }
}
