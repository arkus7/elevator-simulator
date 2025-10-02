import { Test, TestingModule } from '@nestjs/testing';
import { ElevatorEventsGateway } from './elevator-events.gateway';
import { Server, Socket } from 'socket.io';
import {
  ElevatorDestinationScheduledEvent,
  ElevatorFloorReachedEvent,
  ElevatorDestinationReachedEvent,
  ElevatorDoorOpeningEvent,
  ElevatorDoorOpenedEvent,
  ElevatorDoorClosingEvent,
  ElevatorDoorClosedEvent,
  ElevatorMotionMovingEvent,
  ElevatorMotionStoppedEvent,
  ElevatorMotionIdleEvent,
  ElevatorEvent,
} from '../elevator/elevator-event';
import { ElevatorDirection } from '../elevator/elevator.interface';

describe('ElevatorEventsGateway', () => {
  let gateway: ElevatorEventsGateway;
  let mockServer: Partial<Server>;
  let mockSocket: Partial<Socket>;

  beforeEach(async () => {
    mockServer = {
      emit: jest.fn(),
    };

    mockSocket = {
      id: 'test-socket-id',
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [ElevatorEventsGateway],
    }).compile();

    gateway = module.get<ElevatorEventsGateway>(ElevatorEventsGateway);
    gateway.server = mockServer as Server;
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('Connection Handling', () => {
    it('should handle client connection', () => {
      const logSpy = jest.spyOn(gateway['logger'], 'log');
      gateway.handleConnection(mockSocket as Socket);
      expect(logSpy).toHaveBeenCalledWith(`Client connected: ${mockSocket.id}`);
    });

    it('should handle client disconnection', () => {
      const logSpy = jest.spyOn(gateway['logger'], 'log');
      gateway.handleDisconnect(mockSocket as Socket);
      expect(logSpy).toHaveBeenCalledWith(
        `Client disconnected: ${mockSocket.id}`,
      );
    });
  });

  describe('Motion Events', () => {
    it('should handle motion moving event', () => {
      const event = new ElevatorMotionMovingEvent(
        'elevator-1',
        ElevatorDirection.Up,
      );
      gateway.handleMotionMoving(event);

      expect(mockServer.emit).toHaveBeenCalledWith(
        ElevatorEvent.Motion.Moving,
        expect.objectContaining({
          type: ElevatorEvent.Motion.Moving,
          elevatorId: 'elevator-1',
          direction: ElevatorDirection.Up,
          timestamp: expect.any(String),
        }),
      );
    });

    it('should handle motion stopped event', () => {
      const event = new ElevatorMotionStoppedEvent('elevator-1');
      gateway.handleMotionStopped(event);

      expect(mockServer.emit).toHaveBeenCalledWith(
        ElevatorEvent.Motion.Stopped,
        expect.objectContaining({
          type: ElevatorEvent.Motion.Stopped,
          elevatorId: 'elevator-1',
          timestamp: expect.any(String),
        }),
      );
    });

    it('should handle motion idle event', () => {
      const event = new ElevatorMotionIdleEvent('elevator-1');
      gateway.handleMotionIdle(event);

      expect(mockServer.emit).toHaveBeenCalledWith(
        ElevatorEvent.Motion.Idle,
        expect.objectContaining({
          type: ElevatorEvent.Motion.Idle,
          elevatorId: 'elevator-1',
          timestamp: expect.any(String),
        }),
      );
    });

    it('should handle floor reached event', () => {
      const event = new ElevatorFloorReachedEvent('elevator-1', 5);
      gateway.handleFloorReached(event);

      expect(mockServer.emit).toHaveBeenCalledWith(
        ElevatorEvent.Motion.FloorReached,
        expect.objectContaining({
          type: ElevatorEvent.Motion.FloorReached,
          elevatorId: 'elevator-1',
          floor: 5,
          timestamp: expect.any(String),
        }),
      );
    });
  });

  describe('Door Events', () => {
    it('should handle door opening event', () => {
      const event = new ElevatorDoorOpeningEvent('elevator-1');
      gateway.handleDoorOpening(event);

      expect(mockServer.emit).toHaveBeenCalledWith(
        ElevatorEvent.Door.Opening,
        expect.objectContaining({
          type: ElevatorEvent.Door.Opening,
          elevatorId: 'elevator-1',
          timestamp: expect.any(String),
        }),
      );
    });

    it('should handle door opened event', () => {
      const event = new ElevatorDoorOpenedEvent('elevator-1');
      gateway.handleDoorOpened(event);

      expect(mockServer.emit).toHaveBeenCalledWith(
        ElevatorEvent.Door.Opened,
        expect.objectContaining({
          type: ElevatorEvent.Door.Opened,
          elevatorId: 'elevator-1',
          timestamp: expect.any(String),
        }),
      );
    });

    it('should handle door closing event', () => {
      const event = new ElevatorDoorClosingEvent('elevator-1');
      gateway.handleDoorClosing(event);

      expect(mockServer.emit).toHaveBeenCalledWith(
        ElevatorEvent.Door.Closing,
        expect.objectContaining({
          type: ElevatorEvent.Door.Closing,
          elevatorId: 'elevator-1',
          timestamp: expect.any(String),
        }),
      );
    });

    it('should handle door closed event', () => {
      const event = new ElevatorDoorClosedEvent('elevator-1');
      gateway.handleDoorClosed(event);

      expect(mockServer.emit).toHaveBeenCalledWith(
        ElevatorEvent.Door.Closed,
        expect.objectContaining({
          type: ElevatorEvent.Door.Closed,
          elevatorId: 'elevator-1',
          timestamp: expect.any(String),
        }),
      );
    });
  });

  describe('Destination Events', () => {
    it('should handle destination scheduled event', () => {
      const event = new ElevatorDestinationScheduledEvent('elevator-1', 7);
      gateway.handleDestinationScheduled(event);

      expect(mockServer.emit).toHaveBeenCalledWith(
        ElevatorEvent.Destination.Scheduled,
        expect.objectContaining({
          type: ElevatorEvent.Destination.Scheduled,
          elevatorId: 'elevator-1',
          destination: 7,
          timestamp: expect.any(String),
        }),
      );
    });

    it('should handle destination reached event', () => {
      const event = new ElevatorDestinationReachedEvent('elevator-1', 7);
      gateway.handleDestinationReached(event);

      expect(mockServer.emit).toHaveBeenCalledWith(
        ElevatorEvent.Destination.Reached,
        expect.objectContaining({
          type: ElevatorEvent.Destination.Reached,
          elevatorId: 'elevator-1',
          destination: 7,
          timestamp: expect.any(String),
        }),
      );
    });
  });

  describe('Event Broadcasting', () => {
    it('should emit events to all clients', () => {
      const event = new ElevatorMotionMovingEvent(
        'elevator-1',
        ElevatorDirection.Up,
      );
      gateway.handleMotionMoving(event);

      expect(mockServer.emit).toHaveBeenCalled();
    });
  });
});
