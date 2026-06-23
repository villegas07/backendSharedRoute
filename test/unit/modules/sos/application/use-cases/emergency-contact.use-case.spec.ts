import { RegisterEmergencyContactUseCase } from '@/modules/sos/application/use-cases/register-emergency-contact.use-case';
import { GetEmergencyContactsUseCase } from '@/modules/sos/application/use-cases/get-emergency-contacts.use-case';
import { DeleteEmergencyContactUseCase } from '@/modules/sos/application/use-cases/delete-emergency-contact.use-case';
import { EmergencyContactRepository } from '@/modules/sos/domain/ports/emergency-contact.repository';
import { EmergencyContactEntity } from '@/modules/sos/domain/entities/emergency-contact.entity';
import { SosUserRole } from '@/modules/sos/domain/enums/sos-user-role.enum';
import {
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

const makeMockContactRepo = (): jest.Mocked<EmergencyContactRepository> => ({
  save: jest.fn(),
  findById: jest.fn(),
  findByUserId: jest.fn(),
  countByUserId: jest.fn(),
  delete: jest.fn(),
} as jest.Mocked<EmergencyContactRepository>);

const validInput = {
  userId: 'user-1',
  userRole: SosUserRole.DRIVER,
  name: 'María García',
  phone: '+573001234567',
  relationship: 'Mamá',
};

describe('RegisterEmergencyContactUseCase', () => {
  let useCase: RegisterEmergencyContactUseCase;
  let contactRepo: jest.Mocked<EmergencyContactRepository>;

  beforeEach(() => {
    contactRepo = makeMockContactRepo();
    useCase = new RegisterEmergencyContactUseCase(contactRepo);
  });

  it('should register a new emergency contact', async () => {
    contactRepo.countByUserId.mockResolvedValue(0);

    const result = await useCase.execute(validInput);

    expect(result.name).toBe('María García');
    expect(result.phone).toBe('+573001234567');
    expect(result.userId).toBe('user-1');
    expect(contactRepo.save).toHaveBeenCalledWith(result);
  });

  it('should allow up to 3 contacts per user', async () => {
    contactRepo.countByUserId.mockResolvedValue(2);

    const result = await useCase.execute(validInput);

    expect(result).toBeDefined();
    expect(contactRepo.save).toHaveBeenCalled();
  });

  it('should throw BadRequestException when user already has 3 contacts', async () => {
    contactRepo.countByUserId.mockResolvedValue(3);

    await expect(useCase.execute(validInput)).rejects.toThrow(
      BadRequestException,
    );
    expect(contactRepo.save).not.toHaveBeenCalled();
  });

  it('should allow passenger to register emergency contact', async () => {
    contactRepo.countByUserId.mockResolvedValue(0);

    const result = await useCase.execute({
      ...validInput,
      userRole: SosUserRole.PASSENGER,
    });

    expect(result.userId).toBe('user-1');
  });
});

describe('GetEmergencyContactsUseCase', () => {
  let useCase: GetEmergencyContactsUseCase;
  let contactRepo: jest.Mocked<EmergencyContactRepository>;

  beforeEach(() => {
    contactRepo = makeMockContactRepo();
    useCase = new GetEmergencyContactsUseCase(contactRepo);
  });

  it('should return all contacts for a user', async () => {
    const contacts = [
      EmergencyContactEntity.create({
        userId: 'user-1',
        name: 'Mamá',
        phone: '3001111111',
      }),
      EmergencyContactEntity.create({
        userId: 'user-1',
        name: 'Papá',
        phone: '3002222222',
      }),
    ];
    contactRepo.findByUserId.mockResolvedValue(contacts);

    const result = await useCase.execute('user-1');

    expect(result).toHaveLength(2);
    expect(contactRepo.findByUserId).toHaveBeenCalledWith('user-1');
  });

  it('should return empty array if user has no contacts', async () => {
    contactRepo.findByUserId.mockResolvedValue([]);

    const result = await useCase.execute('user-1');

    expect(result).toEqual([]);
  });
});

describe('DeleteEmergencyContactUseCase', () => {
  let useCase: DeleteEmergencyContactUseCase;
  let contactRepo: jest.Mocked<EmergencyContactRepository>;

  beforeEach(() => {
    contactRepo = makeMockContactRepo();
    useCase = new DeleteEmergencyContactUseCase(contactRepo);
  });

  it('should delete existing contact', async () => {
    const contact = EmergencyContactEntity.create({
      userId: 'user-1',
      name: 'Ana',
      phone: '3001234567',
    });
    contactRepo.findById.mockResolvedValue(contact);

    await useCase.execute(contact.id);

    expect(contactRepo.delete).toHaveBeenCalledWith(contact.id);
  });

  it('should throw NotFoundException if contact does not exist', async () => {
    contactRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute('nonexistent')).rejects.toThrow(
      NotFoundException,
    );
  });
});
