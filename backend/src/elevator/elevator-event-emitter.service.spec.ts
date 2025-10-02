import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ElevatorEventEmitterService } from './elevator-event-emitter.service';
import {
  ElevatorEvent,
  ElevatorDestinationScheduledEvent,
  ElevatorFloorReachedEvent,
  ElevatorDestinationReachedEvent,
  ElevatorDoorOpeningEvent,
  ElevatorDoorOpenedEvent,
  ElevatorDoorClosingEvent,
  ElevatorDoorClosedEvent,
} from './elevator-event';

describe('ElevatorEventEmitterService', () => {
  let service: ElevatorEventEmitterService;
  let eventEmitter: EventEmitter2;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ElevatorEventEmitterService,
        {
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ElevatorEventEmitterService>(
      ElevatorEventEmitterService,
    );
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('destinationScheduled', () => {
    it('should emit destination scheduled event', () => {
      const elevatorId = 'elevator-1';
      const destination = 5;

      service.destinationScheduled(elevatorId, destination);

      expect(eventEmitter.emit).toHaveBeenCalledWith(
        ElevatorEvent.Destination.Scheduled,
        expect.any(ElevatorDestinationScheduledEvent),
      );

      const emittedEvent = (eventEmitter.emit as jest.Mock).mock.calls[0][1];
      expect(emittedEvent.elevatorId).toBe(elevatorId);
      expect(emittedEvent.destination).toBe(destination);
    });
  });

  describe('floorReached', () => {
    it('should emit floor reached event', () => {
      const elevatorId = 'elevator-1';
      const floor = 3;

      service.floorReached(elevatorId, floor);

      expect(eventEmitter.emit).toHaveBeenCalledWith(
        ElevatorEvent.Motion.FloorReached,
        expect.any(ElevatorFloorReachedEvent),
      );

      const emittedEvent = (eventEmitter.emit as jest.Mock).mock.calls[0][1];
      expect(emittedEvent.elevatorId).toBe(elevatorId);
      expect(emittedEvent.floor).toBe(floor);
    });
  });

  describe('destinationReached', () => {
    it('should emit destination reached event', () => {
      const elevatorId = 'elevator-1';
      const destination = 7;

      service.destinationReached(elevatorId, destination);

      expect(eventEmitter.emit).toHaveBeenCalledWith(
        ElevatorEvent.Destination.Reached,
        expect.any(ElevatorDestinationReachedEvent),
      );

      const emittedEvent = (eventEmitter.emit as jest.Mock).mock.calls[0][1];
      expect(emittedEvent.elevatorId).toBe(elevatorId);
      expect(emittedEvent.destination).toBe(destination);
    });
  });

  describe('doorOpening', () => {
    it('should emit door opening event', () => {
      const elevatorId = 'elevator-1';

      service.doorOpening(elevatorId);

      expect(eventEmitter.emit).toHaveBeenCalledWith(
        ElevatorEvent.Door.Opening,
        expect.any(ElevatorDoorOpeningEvent),
      );

      const emittedEvent = (eventEmitter.emit as jest.Mock).mock.calls[0][1];
      expect(emittedEvent.elevatorId).toBe(elevatorId);
    });
  });

  describe('doorOpened', () => {
    it('should emit door opened event', () => {
      const elevatorId = 'elevator-1';

      service.doorOpened(elevatorId);

      expect(eventEmitter.emit).toHaveBeenCalledWith(
        ElevatorEvent.Door.Opened,
        expect.any(ElevatorDoorOpenedEvent),
      );

      const emittedEvent = (eventEmitter.emit as jest.Mock).mock.calls[0][1];
      expect(emittedEvent.elevatorId).toBe(elevatorId);
    });
  });

  describe('doorClosing', () => {
    it('should emit door closing event', () => {
      const elevatorId = 'elevator-1';

      service.doorClosing(elevatorId);

      expect(eventEmitter.emit).toHaveBeenCalledWith(
        ElevatorEvent.Door.Closing,
        expect.any(ElevatorDoorClosingEvent),
      );

      const emittedEvent = (eventEmitter.emit as jest.Mock).mock.calls[0][1];
      expect(emittedEvent.elevatorId).toBe(elevatorId);
    });
  });

  describe('doorClosed', () => {
    it('should emit door closed event', () => {
      const elevatorId = 'elevator-1';

      service.doorClosed(elevatorId);

      expect(eventEmitter.emit).toHaveBeenCalledWith(
        ElevatorEvent.Door.Closed,
        expect.any(ElevatorDoorClosedEvent),
      );

      const emittedEvent = (eventEmitter.emit as jest.Mock).mock.calls[0][1];
      expect(emittedEvent.elevatorId).toBe(elevatorId);
    });
  });
});
