import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../../application/use-cases/use-case.interface';
import { EmergencyContactRepository } from '../../domain/ports/emergency-contact.repository';
import { EmergencyContactEntity } from '../../domain/entities/emergency-contact.entity';

@Injectable()
export class GetEmergencyContactsUseCase
  implements UseCase<string, EmergencyContactEntity[]>
{
  constructor(
    private readonly contactRepo: EmergencyContactRepository,
  ) {}

  async execute(userId: string): Promise<EmergencyContactEntity[]> {
    return this.contactRepo.findByUserId(userId);
  }
}
