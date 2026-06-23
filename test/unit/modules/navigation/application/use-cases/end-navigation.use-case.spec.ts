import { EndNavigationUseCase } from '@/modules/navigation/application/use-cases/end-navigation.use-case';
import { NavigationSessionRepository } from '@/modules/navigation/domain/ports/navigation-session.repository';
import { NavigationSessionEntity } from '@/modules/navigation/domain/entities/navigation-session.entity';
import { NavigationStatus } from '@/modules/navigation/domain/enums/navigation-status.enum';
import { NotFoundException } from '@nestjs/common';

describe('EndNavigationUseCase', () => {
  let useCase: EndNavigationUseCase;
  let sessionRepo: jest.Mocked<NavigationSessionRepository>;

  beforeEach(() => {
    sessionRepo = {
      save: jest.fn(),
      findById: jest.fn(),
      findByTripId: jest.fn(),
      findActiveByDriverId: jest.fn(),
      delete: jest.fn(),
    } as jest.Mocked<NavigationSessionRepository>;

    useCase = new EndNavigationUseCase(sessionRepo);
  });

  it('should complete an active session', async () => {
    const session = NavigationSessionEntity.create({
      tripId: 'trip-1',
      driverId: 'driver-1',
      passengerIds: ['pass-1'],
      originLat: 4.711,
      originLng: -74.072,
      destinationLat: 4.609,
      destinationLng: -74.081,
    });
    session.start();

    sessionRepo.findById.mockResolvedValue(session);

    const result = await useCase.execute({
      sessionId: session.id,
      driverId: 'driver-1',
    });

    expect(result.status).toBe(NavigationStatus.COMPLETED);
    expect(sessionRepo.save).toHaveBeenCalled();
  });

  it('should throw NotFoundException if session not found', async () => {
    sessionRepo.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({ sessionId: 'x', driverId: 'driver-1' }),
    ).rejects.toThrow(NotFoundException);
  });
});
