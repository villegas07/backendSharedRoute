import { NavigationGateway } from '@/modules/navigation/presentation/gateways/navigation.gateway';
import { UpdateDriverLocationUseCase } from '@/modules/navigation/application/use-cases/update-driver-location.use-case';
import { GetNavigationViewUseCase } from '@/modules/navigation/application/use-cases/get-navigation-view.use-case';
import { Server, Socket } from 'socket.io';

describe('NavigationGateway', () => {
  let gateway: NavigationGateway;
  let updateLocationUseCase: jest.Mocked<UpdateDriverLocationUseCase>;
  let getViewUseCase: jest.Mocked<GetNavigationViewUseCase>;
  let mockClient: Partial<Socket>;

  beforeEach(() => {
    updateLocationUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<UpdateDriverLocationUseCase>;

    getViewUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<GetNavigationViewUseCase>;

    gateway = new NavigationGateway(updateLocationUseCase, getViewUseCase);

    mockClient = {
      id: 'socket-1',
      handshake: { query: { userId: 'user-1' } } as never,
      join: jest.fn(),
      leave: jest.fn(),
      emit: jest.fn(),
      to: jest.fn().mockReturnValue({ emit: jest.fn() }),
    };

    gateway.server = {
      to: jest.fn().mockReturnValue({ emit: jest.fn() }),
    } as unknown as Server;
  });

  describe('handleConnection', () => {
    it('should register user socket mapping', () => {
      gateway.handleConnection(mockClient as Socket);
      // No exception thrown
    });
  });

  describe('handleDisconnect', () => {
    it('should clean up user socket mapping', () => {
      gateway.handleConnection(mockClient as Socket);
      gateway.handleDisconnect(mockClient as Socket);
      // No exception thrown
    });
  });

  describe('handleJoinSession', () => {
    it('should join the session room', () => {
      gateway.handleJoinSession(
        { sessionId: 'session-1', role: 'DRIVER' },
        mockClient as Socket,
      );

      expect(mockClient.join).toHaveBeenCalledWith('session:session-1');
    });
  });

  describe('handleLeaveSession', () => {
    it('should leave the session room', () => {
      gateway.handleLeaveSession(
        { sessionId: 'session-1' },
        mockClient as Socket,
      );

      expect(mockClient.leave).toHaveBeenCalledWith('session:session-1');
    });
  });

  describe('handleDriverLocation', () => {
    it('should broadcast location to driver and passengers', async () => {
      const locationResult = {
        session: { status: 'ACTIVE' },
        etaSeconds: 600,
      };
      const driverView = {
        sessionId: 'session-1',
        status: 'ACTIVE',
        route: {},
        currentStepIndex: 0,
        etaSeconds: 600,
        passengers: ['pass-1'],
      };

      updateLocationUseCase.execute.mockResolvedValue(locationResult as never);
      getViewUseCase.execute.mockResolvedValue(driverView as never);

      await gateway.handleDriverLocation(
        {
          sessionId: 'session-1',
          driverId: 'driver-1',
          latitude: 4.715,
          longitude: -74.075,
          heading: 90,
          speed: 30,
        },
        mockClient as Socket,
      );

      expect(mockClient.emit).toHaveBeenCalledWith(
        'driver:navigation-update',
        driverView,
      );
      expect(mockClient.to).toHaveBeenCalledWith('session:session-1');
    });

    it('should emit error on failure', async () => {
      updateLocationUseCase.execute.mockRejectedValue(
        new Error('Session not found'),
      );

      await gateway.handleDriverLocation(
        {
          sessionId: 'x',
          driverId: 'driver-1',
          latitude: 0,
          longitude: 0,
        },
        mockClient as Socket,
      );

      expect(mockClient.emit).toHaveBeenCalledWith('navigation:error', {
        message: 'Session not found',
      });
    });
  });

  describe('broadcastSessionEnded', () => {
    it('should emit navigation:completed to all in room', () => {
      gateway.broadcastSessionEnded('session-1');

      expect(gateway.server.to).toHaveBeenCalledWith('session:session-1');
    });
  });

  describe('broadcastSessionCancelled', () => {
    it('should emit navigation:cancelled to all in room', () => {
      gateway.broadcastSessionCancelled('session-1');

      expect(gateway.server.to).toHaveBeenCalledWith('session:session-1');
    });
  });
});
