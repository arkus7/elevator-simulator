import { Test, TestingModule } from '@nestjs/testing';
import { ElevatorService } from './elevator.service';
import {
  ElevatorDirection,
  ElevatorDoorState,
  ElevatorStatus,
} from './elevator.interface';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ElevatorCreationService } from '../elevator-registry/elevator-creation/elevator-creation.service';
import { ElevatorEventEmitterService } from './elevator-event-emitter.service';

describe('ElevatorService', () => {
  let service: ElevatorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ElevatorService,
        ElevatorEventEmitterService,
        {
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ElevatorService>(ElevatorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create an elevator', () => {
    const elevator = ElevatorCreationService.createElevator();
    expect(elevator).toBeDefined();
    expect(elevator.id).toBeDefined();
    expect(elevator.currentFloor).toBe(0);
    expect(elevator.direction).toBe(ElevatorDirection.Idle);
    expect(elevator.doorState).toBe(ElevatorDoorState.Closed);
    expect(elevator.destinationFloors).toEqual([]);
  });

  describe('#scheduleInternalRequest', () => {
    it('should schedule an internal request', () => {
      const elevator = ElevatorCreationService.createElevator();
      service.scheduleCarRequest(elevator, 1);
      expect(elevator.destinationFloors).toEqual([1]);
    });

    it('should not schedule an internal request if the elevator is in maintenance', () => {
      const elevator = ElevatorCreationService.createElevator();
      elevator.status = ElevatorStatus.Maintenance;
      service.scheduleCarRequest(elevator, 1);
      expect(elevator.destinationFloors).toEqual([]);
    });

    it('should not schedule an internal request if the elevator is in error', () => {
      const elevator = ElevatorCreationService.createElevator();
      elevator.status = ElevatorStatus.Error;

      service.scheduleCarRequest(elevator, 1);
      expect(elevator.destinationFloors).toEqual([]);
    });

    it('should not schedule an internal request if the floor is already in the destination floors', () => {
      const elevator = ElevatorCreationService.createElevator();
      elevator.destinationFloors = [1];
      service.scheduleCarRequest(elevator, 1);
      expect(elevator.destinationFloors).toEqual([1]);
    });

    describe('when the elevator is not idle', () => {
      describe('when the elevator is moving up', () => {
        it('should schedule the request in the correct order', () => {
          const elevator = ElevatorCreationService.createElevator();
          elevator.direction = ElevatorDirection.Up;
          elevator.currentFloor = 1;
          elevator.destinationFloors = [2, -1];
          service.scheduleCarRequest(elevator, 3);
          expect(elevator.destinationFloors).toEqual([2, 3, -1]);
        });

        it('should handle negative floors correctly', () => {
          const elevator = ElevatorCreationService.createElevator();
          elevator.direction = ElevatorDirection.Up;
          elevator.currentFloor = 1;
          elevator.destinationFloors = [2];
          service.scheduleCarRequest(elevator, -1);
          expect(elevator.destinationFloors).toEqual([2, -1]);
        });
      });

      describe('when the elevator is moving down', () => {
        it('should schedule the request in the correct order', () => {
          const elevator = ElevatorCreationService.createElevator();
          elevator.direction = ElevatorDirection.Down;
          elevator.currentFloor = 1;
          elevator.destinationFloors = [-1, 2];
          service.scheduleCarRequest(elevator, 3);
          expect(elevator.destinationFloors).toEqual([-1, 2, 3]);
        });

        it('should handle negative floors correctly', () => {
          const elevator = ElevatorCreationService.createElevator();
          elevator.direction = ElevatorDirection.Down;
          elevator.currentFloor = 1;
          elevator.destinationFloors = [0, 2];
          service.scheduleCarRequest(elevator, -1);
          expect(elevator.destinationFloors).toEqual([0, -1, 2]);
        });
      });
    });
  });
});
