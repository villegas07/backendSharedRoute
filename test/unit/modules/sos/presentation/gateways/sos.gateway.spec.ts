import { SosGateway } from '@/modules/sos/presentation/gateways/sos.gateway';
import { SosAlertEntity } from '@/modules/sos/domain/entities/sos-alert.entity';
import { SosAlertStatus } from '@/modules/sos/domain/enums/sos-alert-status.enum';
import { SosUserRole } from '@/modules/sos/domain/enums/sos-user-role.enum';
import { Server } from 'socket.io';

const makeAlert = () =>
  SosAlertEntity.create({
    userId: 'driver-1',
    userRole: SosUserRole.DRIVER,
    tripId: 'trip-1',
    latitude: 4.711,
    longitude: -74.0721,
    message: 'Emergencia',
  });

describe('SosGateway', () => {
  let gateway: SosGateway;
  let mockServer: { emit: jest.Mock };

  beforeEach(() => {
    gateway = new SosGateway();
    mockServer = { emit: jest.fn() };
    gateway.server = mockServer as unknown as Server;
  });

  describe('broadcastSosTriggered()', () => {
    it('should emit sos:alert-triggered to all connected clients', () => {
      const alert = makeAlert();

      gateway.broadcastSosTriggered(alert);

      expect(mockServer.emit).toHaveBeenCalledWith(
        'sos:alert-triggered',
        expect.objectContaining({
          alertId: alert.id,
          userId: 'driver-1',
          userRole: SosUserRole.DRIVER,
          tripId: 'trip-1',
          status: SosAlertStatus.ACTIVE,
        }),
      );
    });

    it('should include coordinates in the broadcast', () => {
      const alert = makeAlert();

      gateway.broadcastSosTriggered(alert);

      expect(mockServer.emit).toHaveBeenCalledWith(
        'sos:alert-triggered',
        expect.objectContaining({
          latitude: 4.711,
          longitude: -74.0721,
          message: 'Emergencia',
        }),
      );
    });
  });

  describe('broadcastSosResolved()', () => {
    it('should emit sos:alert-resolved to all clients', () => {
      gateway.broadcastSosResolved('alert-id-123', 'admin-1');

      expect(mockServer.emit).toHaveBeenCalledWith('sos:alert-resolved', {
        alertId: 'alert-id-123',
        resolvedById: 'admin-1',
      });
    });
  });
});
