import { Test, TestingModule } from '@nestjs/testing';
import { ElevatorService } from './elevator.service';
import {
  Elevator,
  ElevatorDirection,
  ElevatorDoorState,
  ElevatorMotionState,
  ElevatorStatus,
} from './elevator.interface';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ElevatorCreationService } from '../elevator-registry/elevator-creation/elevator-creation.service';
import { ElevatorEventEmitterService } from './elevator-event-emitter.service';
import { BadRequestException } from '@nestjs/common';

describe('ElevatorService', () => {
  let service: ElevatorService;
  let elevatorEventEmitter: ElevatorEventEmitterService;

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
    elevatorEventEmitter = module.get<ElevatorEventEmitterService>(
      ElevatorEventEmitterService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('#scheduleCarRequest', () => {
    it('should schedule an car request', () => {
      const elevator = createElevator();
      service.scheduleCarRequest(elevator, 1);
      expect(elevator.destinationFloors).toEqual([1]);
    });

    it('should not schedule an car request if the elevator is in maintenance', () => {
      const elevator = createElevator();
      elevator.status = ElevatorStatus.Maintenance;
      service.scheduleCarRequest(elevator, 1);
      expect(elevator.destinationFloors).toEqual([]);
    });

    it('should not schedule an car request if the elevator is in error', () => {
      const elevator = createElevator();
      elevator.status = ElevatorStatus.Error;

      service.scheduleCarRequest(elevator, 1);
      expect(elevator.destinationFloors).toEqual([]);
    });

    it('should not schedule an car request if the floor is already in the destination floors', () => {
      const elevator = createElevator();
      elevator.destinationFloors = [1];
      service.scheduleCarRequest(elevator, 1);
      expect(elevator.destinationFloors).toEqual([1]);
    });

    describe('when the elevator is not idle', () => {
      describe('when the elevator is moving up', () => {
        it('should schedule the request in the correct order', () => {
          const elevator = createElevator({
            direction: ElevatorDirection.Up,
            currentFloor: 1,
            destinationFloors: [2, -1],
          });
          service.scheduleCarRequest(elevator, 3);
          expect(elevator.destinationFloors).toEqual([2, 3, -1]);
        });

        it('should handle negative floors correctly', () => {
          const elevator = createElevator({
            direction: ElevatorDirection.Up,
            currentFloor: 1,
            destinationFloors: [2],
          });
          service.scheduleCarRequest(elevator, -1);
          expect(elevator.destinationFloors).toEqual([2, -1]);
        });
      });

      describe('when the elevator is moving down', () => {
        it('should schedule the request in the correct order', () => {
          const elevator = createElevator({
            direction: ElevatorDirection.Down,
            currentFloor: 1,
            destinationFloors: [-1, 2],
          });
          service.scheduleCarRequest(elevator, 3);
          expect(elevator.destinationFloors).toEqual([-1, 2, 3]);
        });

        it('should handle negative floors correctly', () => {
          const elevator = createElevator({
            direction: ElevatorDirection.Down,
            currentFloor: 1,
            destinationFloors: [0, 2],
          });
          service.scheduleCarRequest(elevator, -1);
          expect(elevator.destinationFloors).toEqual([0, -1, 2]);
        });
      });
    });

    describe('event emission', () => {
      it('should emit car request event', () => {
        jest.spyOn(elevatorEventEmitter, 'destinationScheduled');
        const elevator = createElevator();
        service.scheduleCarRequest(elevator, 1);
        expect(elevatorEventEmitter.destinationScheduled).toHaveBeenCalledWith(
          elevator.id,
          1,
          elevator.destinationFloors,
        );
      });
    });
  });

  describe('#startOpeningDoor', () => {
    it('should start opening the door if the door is closed', () => {
      const elevator = createElevator({
        doorState: ElevatorDoorState.Closed,
      });
      service.startOpeningDoor(elevator);
      expect(elevator.doorState).toBe(ElevatorDoorState.Opening);
    });

    it('should start opening the door if the door is closing', () => {
      const elevator = createElevator({
        doorState: ElevatorDoorState.Closing,
      });
      service.startOpeningDoor(elevator);
      expect(elevator.doorState).toBe(ElevatorDoorState.Opening);
    });

    it('should throw an error if the elevator is moving', () => {
      const elevator = createElevator({
        motionState: ElevatorMotionState.Moving,
      });
      expect(() => service.startOpeningDoor(elevator)).toThrow(
        BadRequestException,
      );
    });

    it('should throw an error if the door is not closed or closing', () => {
      const elevator = createElevator({
        doorState: ElevatorDoorState.Open,
      });
      expect(() => service.startOpeningDoor(elevator)).toThrow(
        BadRequestException,
      );
    });

    describe('event emission', () => {
      it('should emit door opening event', () => {
        jest.spyOn(elevatorEventEmitter, 'doorOpening');
        const elevator = createElevator({
          doorState: ElevatorDoorState.Closed,
        });
        service.startOpeningDoor(elevator);
        expect(elevatorEventEmitter.doorOpening).toHaveBeenCalledWith(
          elevator.id,
        );
      });
    });
  });

  describe('#completeOpeningDoor', () => {
    it('should complete opening the door if the door is opening', () => {
      const elevator = createElevator({
        doorState: ElevatorDoorState.Opening,
      });
      service.completeOpeningDoor(elevator);
      expect(elevator.doorState).toBe(ElevatorDoorState.Open);
    });

    it('should not complete opening the door if the door is not opening', () => {
      const elevator = createElevator({
        doorState: ElevatorDoorState.Closed,
      });
      service.completeOpeningDoor(elevator);
      expect(elevator.doorState).toBe(ElevatorDoorState.Closed);
    });

    describe('event emission', () => {
      it('should emit door opened event', () => {
        jest.spyOn(elevatorEventEmitter, 'doorOpened');
        const elevator = createElevator({
          doorState: ElevatorDoorState.Opening,
        });
        service.completeOpeningDoor(elevator);
        expect(elevatorEventEmitter.doorOpened).toHaveBeenCalledWith(
          elevator.id,
        );
      });
    });
  });

  describe('#startClosingDoor', () => {
    it('should start closing the door if the door is open', () => {
      const elevator = createElevator({
        doorState: ElevatorDoorState.Open,
      });
      service.startClosingDoor(elevator);
      expect(elevator.doorState).toBe(ElevatorDoorState.Closing);
    });

    it('should throw an error if the door is not open', () => {
      const elevator = createElevator({
        doorState: ElevatorDoorState.Closed,
      });
      expect(() => service.startClosingDoor(elevator)).toThrow(
        BadRequestException,
      );
    });

    describe('event emission', () => {
      it('should emit door closing event', () => {
        jest.spyOn(elevatorEventEmitter, 'doorClosing');
        const elevator = createElevator({
          doorState: ElevatorDoorState.Open,
        });
        service.startClosingDoor(elevator);
        expect(elevatorEventEmitter.doorClosing).toHaveBeenCalledWith(
          elevator.id,
        );
      });
    });
  });

  describe('#completeClosingDoor', () => {
    it('should complete closing the door if the door is closing', () => {
      const elevator = createElevator({
        doorState: ElevatorDoorState.Closing,
      });
      service.completeClosingDoor(elevator);
      expect(elevator.doorState).toBe(ElevatorDoorState.Closed);
    });

    it('should not complete closing the door if the door is not closing', () => {
      const elevator = createElevator({
        doorState: ElevatorDoorState.Open,
      });
      service.completeClosingDoor(elevator);
      expect(elevator.doorState).toBe(ElevatorDoorState.Open);
    });

    it('should start moving the elevator if the door is closed', () => {
      const elevator = createElevator({
        doorState: ElevatorDoorState.Closing,
        destinationFloors: [1],
      });
      service.completeClosingDoor(elevator);
      expect(elevator.motionState).toBe(ElevatorMotionState.Moving);
      expect(elevator.direction).toBe(ElevatorDirection.Up);
    });

    it('should become idle if the destination floors are empty', () => {
      const elevator = createElevator({
        doorState: ElevatorDoorState.Closing,
        destinationFloors: [],
        motionState: ElevatorMotionState.Stopped,
      });
      service.completeClosingDoor(elevator);
      expect(elevator.motionState).toBe(ElevatorMotionState.Idle);
    });

    describe('event emission', () => {
      it('should emit door closed event', () => {
        jest.spyOn(elevatorEventEmitter, 'doorClosed');
        const elevator = createElevator({
          doorState: ElevatorDoorState.Closing,
        });
        service.completeClosingDoor(elevator);
        expect(elevatorEventEmitter.doorClosed).toHaveBeenCalledWith(
          elevator.id,
        );
      });
    });
  });

  describe('#startMoving', () => {
    it('should start moving the elevator if the door is closed', () => {
      const elevator = createElevator({
        doorState: ElevatorDoorState.Closed,
        destinationFloors: [1],
      });
      service.startMoving(elevator);
      expect(elevator.motionState).toBe(ElevatorMotionState.Moving);
    });

    it('should not change the motion state if the elevator is already moving', () => {
      const elevator = createElevator({
        motionState: ElevatorMotionState.Moving,
        destinationFloors: [1],
        currentFloor: 0,
      });
      service.startMoving(elevator);
      expect(elevator.motionState).toBe(ElevatorMotionState.Moving);
    });

    it('should change motion state to idle if the destination floors are empty', () => {
      const elevator = createElevator({
        destinationFloors: [],
        motionState: ElevatorMotionState.Stopped,
      });
      service.startMoving(elevator);
      expect(elevator.motionState).toBe(ElevatorMotionState.Idle);
    });

    it('should change direction to up if the target floor is above the current floor', () => {
      const elevator = createElevator({
        currentFloor: 1,
        destinationFloors: [2],
      });
      service.startMoving(elevator);
      expect(elevator.direction).toBe(ElevatorDirection.Up);
    });

    it('should change direction to down if the target floor is below the current floor', () => {
      const elevator = createElevator({
        currentFloor: 1,
        destinationFloors: [-1],
      });
      service.startMoving(elevator);
      expect(elevator.direction).toBe(ElevatorDirection.Down);
    });

    it('should change direction to idle if the target floor is the same as the current floor', () => {
      const elevator = createElevator({
        currentFloor: 1,
        destinationFloors: [1],
      });
      service.startMoving(elevator);
      expect(elevator.direction).toBe(ElevatorDirection.Idle);
    });

    it('should start opening the door if the target floor is the same as the current floor', () => {
      const elevator = createElevator({
        currentFloor: 1,
        destinationFloors: [1],
      });
      service.startMoving(elevator);
      expect(elevator.doorState).toBe(ElevatorDoorState.Opening);
    });

    it('should not start opening the door if the target floor is not the same as the current floor', () => {
      const elevator = createElevator({
        currentFloor: 1,
        destinationFloors: [2],
      });
      service.startMoving(elevator);
      expect(elevator.doorState).toBe(ElevatorDoorState.Closed);
    });

    describe('event emission', () => {
      it('should emit motion moving event', () => {
        jest.spyOn(elevatorEventEmitter, 'motionMoving');
        const elevator = createElevator({
          destinationFloors: [1],
        });
        service.startMoving(elevator);
        expect(elevatorEventEmitter.motionMoving).toHaveBeenCalledWith(
          elevator.id,
          elevator.direction,
        );
      });

      it('should emit motion moving event with the direction up', () => {
        jest.spyOn(elevatorEventEmitter, 'motionMoving');
        const elevator = createElevator({
          destinationFloors: [1],
          currentFloor: 0,
        });
        service.startMoving(elevator);
        expect(elevatorEventEmitter.motionMoving).toHaveBeenCalledWith(
          elevator.id,
          ElevatorDirection.Up,
        );
      });

      it('should emit motion moving event with the direction down', () => {
        jest.spyOn(elevatorEventEmitter, 'motionMoving');
        const elevator = createElevator({
          destinationFloors: [-1],
          currentFloor: 0,
        });
        service.startMoving(elevator);
        expect(elevatorEventEmitter.motionMoving).toHaveBeenCalledWith(
          elevator.id,
          ElevatorDirection.Down,
        );
      });

      it('should emit motion idle event if the destination floors are empty', () => {
        jest.spyOn(elevatorEventEmitter, 'motionIdle');
        const elevator = createElevator({
          destinationFloors: [],
        });
        service.startMoving(elevator);
        expect(elevatorEventEmitter.motionIdle).toHaveBeenCalledWith(
          elevator.id,
        );
      });
    });
  });

  describe('#reachedFloor', () => {
    it('should increment floor when moving up', () => {
      const elevator = createElevator({
        currentFloor: 1,
        direction: ElevatorDirection.Up,
        motionState: ElevatorMotionState.Moving,
        destinationFloors: [3],
      });
      service.reachedFloor(elevator);
      expect(elevator.currentFloor).toBe(2);
    });

    it('should decrement floor when moving down', () => {
      const elevator = createElevator({
        currentFloor: 1,
        direction: ElevatorDirection.Down,
        motionState: ElevatorMotionState.Moving,
        destinationFloors: [-1],
      });
      service.reachedFloor(elevator);
      expect(elevator.currentFloor).toBe(0);
    });

    it('should emit floor reached event', () => {
      jest.spyOn(elevatorEventEmitter, 'floorReached');
      const elevator = createElevator({
        currentFloor: 0,
        direction: ElevatorDirection.Up,
        motionState: ElevatorMotionState.Moving,
        destinationFloors: [2],
      });
      service.reachedFloor(elevator);
      expect(elevatorEventEmitter.floorReached).toHaveBeenCalledWith(
        elevator.id,
        1,
      );
    });

    it('should call reachedDestination when at destination floor', () => {
      const elevator = createElevator({
        currentFloor: 0,
        direction: ElevatorDirection.Up,
        motionState: ElevatorMotionState.Moving,
        destinationFloors: [1],
      });
      service.reachedFloor(elevator);
      expect(elevator.destinationFloors).toEqual([]);
      expect(elevator.doorState).toBe(ElevatorDoorState.Opening);
      expect(elevator.motionState).toBe(ElevatorMotionState.Stopped);
    });

    it('should continue moving if not at destination', () => {
      jest.spyOn(elevatorEventEmitter, 'motionMoving');
      const elevator = createElevator({
        currentFloor: 0,
        direction: ElevatorDirection.Up,
        motionState: ElevatorMotionState.Moving,
        destinationFloors: [5],
      });
      service.reachedFloor(elevator);
      expect(elevator.motionState).toBe(ElevatorMotionState.Moving);
    });

    it('should start opening the door when reaching the destination floor', () => {
      const elevator = createElevator({
        currentFloor: 0,
        destinationFloors: [1],
        motionState: ElevatorMotionState.Moving,
        direction: ElevatorDirection.Up,
      });
      service.reachedFloor(elevator);
      expect(elevator.doorState).toBe(ElevatorDoorState.Opening);
    });

    it('should do nothing if elevator is not moving', () => {
      const elevator = createElevator({
        currentFloor: 1,
        motionState: ElevatorMotionState.Idle,
      });
      service.reachedFloor(elevator);
      expect(elevator.currentFloor).toBe(1);
    });

    it('should do nothing if elevator is stopped', () => {
      const elevator = createElevator({
        currentFloor: 1,
        motionState: ElevatorMotionState.Stopped,
      });
      service.reachedFloor(elevator);
      expect(elevator.currentFloor).toBe(1);
    });

    describe('event emission', () => {
      describe('when reached destination', () => {
        it('should emit motion stopped event', () => {
          jest.spyOn(elevatorEventEmitter, 'motionStopped');
          const elevator = createElevator({
            destinationFloors: [1],
            direction: ElevatorDirection.Up,
            motionState: ElevatorMotionState.Moving,
            currentFloor: 0,
          });

          service.reachedFloor(elevator);
          expect(elevatorEventEmitter.motionStopped).toHaveBeenCalledWith(
            elevator.id,
          );
        });

        it('should emit destination reached event', () => {
          jest.spyOn(elevatorEventEmitter, 'destinationReached');
          const elevator = createElevator({
            destinationFloors: [1],
            direction: ElevatorDirection.Up,
            motionState: ElevatorMotionState.Moving,
            currentFloor: 0,
          });

          service.reachedFloor(elevator);
          expect(elevatorEventEmitter.destinationReached).toHaveBeenCalledWith(
            elevator.id,
            1,
          );
        });

        it('should emit door opening event', () => {
          jest.spyOn(elevatorEventEmitter, 'doorOpening');
          const elevator = createElevator({
            currentFloor: 0,
            destinationFloors: [1],
            motionState: ElevatorMotionState.Moving,
            direction: ElevatorDirection.Up,
          });

          service.reachedFloor(elevator);
          expect(elevatorEventEmitter.doorOpening).toHaveBeenCalledWith(
            elevator.id,
          );
        });
      });
    });
  });
});

function createElevator(overrides: Partial<Elevator> = {}): Elevator {
  return {
    id: overrides.id ?? 'elevator-default',
    currentFloor: overrides.currentFloor ?? 0,
    direction: overrides.direction ?? ElevatorDirection.Idle,
    doorState: overrides.doorState ?? ElevatorDoorState.Closed,
    motionState: overrides.motionState ?? ElevatorMotionState.Idle,
    destinationFloors: overrides.destinationFloors ?? [],
    status: overrides.status ?? ElevatorStatus.Active,
  };
}
