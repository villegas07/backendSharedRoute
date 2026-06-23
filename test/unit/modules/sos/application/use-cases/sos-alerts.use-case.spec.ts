import { TriggerSosAlertUseCase } from '@/modules/sos/application/use-cases/trigger-sos-alert.use-case';
import { ResolveSosAlertUseCase } from '@/modules/sos/application/use-cases/resolve-sos-alert.use-case';
import { EmergencyContactRepository } from '@/modules/sos/domain/ports/emergency-contact.repository';
import { SosAlertRepository } from '@/modules/sos/domain/ports/sos-alert.repository';
import { SosNotificationPort } from '@/modules/sos/domain/ports/sos-notification.port';
import { EmergencyContactEntity } from '@/modules/sos/domain/entities/emergency-contact.entity';
import { SosAlertEntity } from '@/modules/sos/domain/entities/sos-alert.entity';
import { SosAlertStatus } from '@/modules/sos/domain/enums/sos-alert-status.enum';
import { SosUserRole } from '@/modules/sos/domain/enums/sos-user-role.enum';
import { NotFoundException } from '@nestjs/common';

const makeMockContactRepo = (): jest.Mocked<EmergencyContactRepository> => ({
  save: jest.fn(),
  findById: jest.fn(),
  findByUserId: jest.fn(),
  countByUserId: jest.fn(),
  delete: jest.fn(),
} as jest.Mocked<EmergencyContactRepository>);

const makeMockAlertRepo = (): jest.Mocked<SosAlertRepository> => ({
  save: jest.fn(),
  findById: jest.fn(),
  findActiveByUserId: jest.fn(),
  findAllActive: jest.fn(),
} as jest.Mocked<SosAlertRepository>);

const makeMockNotificationPort = (): jest.Mocked<SosNotificationPort> => ({
  notifyEmergencyContacts: jest.fn(),
} as jest.Mocked<SosNotificationPort>);

const mockContacts = [
  EmergencyContactEntity.create({
    userId: 'driver-1',
    name: 'Mamá',
    phone: '+573001111111',
    relationship: 'Mamá',
  }),
  EmergencyContactEntity.create({
    userId: 'driver-1',
    name: 'Papá',
    phone: '+573002222222',
    relationship: 'Papá',
  }),
];

describe('TriggerSosAlertUseCase', () => {
  let useCase: TriggerSosAlertUseCase;
  let contactRepo: jest.Mocked<EmergencyContactRepository>;
  let alertRepo: jest.Mocked<SosAlertRepository>;
  let notificationPort: jest.Mocked<SosNotificationPort>;

  beforeEach(() => {
    contactRepo = makeMockContactRepo();
    alertRepo = makeMockAlertRepo();
    notificationPort = makeMockNotificationPort();
    useCase = new TriggerSosAlertUseCase(
      contactRepo,
      alertRepo,
      notificationPort,
    );
  });

  it('should create ACTIVE alert and notify emergency contacts', async () => {
    contactRepo.findByUserId.mockResolvedValue(mockContacts);
    notificationPort.notifyEmergencyContacts.mockResolvedValue();

    const result = await useCase.execute({
      userId: 'driver-1',
      userRole: SosUserRole.DRIVER,
      tripId: 'trip-1',
      latitude: 4.711,
      longitude: -74.0721,
      message: 'Accidente de tráfico',
    });

    expect(result.status).toBe(SosAlertStatus.ACTIVE);
    expect(result.userId).toBe('driver-1');
    expect(result.tripId).toBe('trip-1');
    expect(alertRepo.save).toHaveBeenCalledWith(result);
    expect(notificationPort.notifyEmergencyContacts).toHaveBeenCalledWith(
      mockContacts,
      result,
      expect.objectContaining({ tripId: 'trip-1' }),
    );
  });

  it('should create alert even when user has no emergency contacts', async () => {
    contactRepo.findByUserId.mockResolvedValue([]);
    notificationPort.notifyEmergencyContacts.mockResolvedValue();

    const result = await useCase.execute({
      userId: 'driver-1',
      userRole: SosUserRole.DRIVER,
    });

    expect(result.status).toBe(SosAlertStatus.ACTIVE);
    expect(alertRepo.save).toHaveBeenCalled();
    expect(notificationPort.notifyEmergencyContacts).toHaveBeenCalledWith(
      [],
      result,
      expect.anything(),
    );
  });

  it('should work for PASSENGER role', async () => {
    contactRepo.findByUserId.mockResolvedValue(mockContacts);
    notificationPort.notifyEmergencyContacts.mockResolvedValue();

    const result = await useCase.execute({
      userId: 'pass-1',
      userRole: SosUserRole.PASSENGER,
      latitude: 4.711,
      longitude: -74.0721,
    });

    expect(result.userRole).toBe(SosUserRole.PASSENGER);
  });

  it('should trigger alert without trip (standalone SOS)', async () => {
    contactRepo.findByUserId.mockResolvedValue([]);
    notificationPort.notifyEmergencyContacts.mockResolvedValue();

    const result = await useCase.execute({
      userId: 'user-1',
      userRole: SosUserRole.DRIVER,
    });

    expect(result.tripId).toBeUndefined();
    expect(result.status).toBe(SosAlertStatus.ACTIVE);
  });
});

describe('ResolveSosAlertUseCase', () => {
  let useCase: ResolveSosAlertUseCase;
  let alertRepo: jest.Mocked<SosAlertRepository>;

  beforeEach(() => {
    alertRepo = makeMockAlertRepo();
    useCase = new ResolveSosAlertUseCase(alertRepo);
  });

  it('should resolve an active alert', async () => {
    const alert = SosAlertEntity.create({
      userId: 'driver-1',
      userRole: SosUserRole.DRIVER,
    });
    alertRepo.findById.mockResolvedValue(alert);

    const result = await useCase.execute({
      alertId: alert.id,
      resolvedById: 'admin-1',
    });

    expect(result.status).toBe(SosAlertStatus.RESOLVED);
    expect(result.resolvedById).toBe('admin-1');
    expect(alertRepo.save).toHaveBeenCalled();
  });

  it('should throw NotFoundException if alert not found', async () => {
    alertRepo.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({ alertId: 'nonexistent', resolvedById: 'admin-1' }),
    ).rejects.toThrow(NotFoundException);
  });
});
