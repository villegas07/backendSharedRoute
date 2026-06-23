import { Injectable, BadRequestException } from '@nestjs/common';
import { UseCase } from '../../../../application/use-cases/use-case.interface';
import { EmergencyContactRepository } from '../../domain/ports/emergency-contact.repository';
import { EmergencyContactEntity } from '../../domain/entities/emergency-contact.entity';
import { SosUserRole } from '../../domain/enums/sos-user-role.enum';

interface RegisterEmergencyContactInput {
  userId: string;
  userRole: SosUserRole;
  name: string;
  phone: string;
  relationship?: string;
}

@Injectable()
export class RegisterEmergencyContactUseCase
  implements UseCase<RegisterEmergencyContactInput, EmergencyContactEntity>
{
  constructor(
    private readonly contactRepo: EmergencyContactRepository,
  ) {}

  async execute(
    input: RegisterEmergencyContactInput,
  ): Promise<EmergencyContactEntity> {
    const count = await this.contactRepo.countByUserId(input.userId);
    if (count >= 3) {
      throw new BadRequestException(
        'No puedes registrar más de 3 contactos de emergencia',
      );
    }

    const contact = EmergencyContactEntity.create({
      userId: input.userId,
      name: input.name,
      phone: input.phone,
      relationship: input.relationship,
    });

    await this.contactRepo.save(contact);
    return contact;
  }
}
