import { Test, TestingModule } from '@nestjs/testing';
import {
  ElevatorSchedulerService,
  HallRequest,
} from './elevator-scheduler.service';
import {
  Elevator,
  ElevatorDirection,
  ElevatorStatus,
  ElevatorDoorState,
  ElevatorMotionState,
} from '../../elevator/elevator.interface';
import { ElevatorModule } from '../../elevator/elevator.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { Config } from '@unifig/core';
import { EnvConfigAdapter } from '@unifig/adapter-env';
import { AppConfig } from '../../config/app.config';

describe('ElevatorSchedulerService', () => {
  let service: ElevatorSchedulerService;

  beforeEach(async () => {
    await Config.register({
      templates: [AppConfig],
      adapter: new EnvConfigAdapter(),
    });
    const module: TestingModule = await Test.createTestingModule({
      imports: [EventEmitterModule.forRoot(), ElevatorModule],
      providers: [ElevatorSchedulerService],
    }).compile();

    service = module.get<ElevatorSchedulerService>(ElevatorSchedulerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('#assignElevatorToHallRequest', () => {
    describe('error cases', () => {
      it('should throw error when no elevators are available', () => {
        const request: HallRequest = {
          floor: 5,
          direction: ElevatorDirection.Up,
        };

        expect(() => service.assignElevatorToHallRequest(request, [])).toThrow(
          'No active elevators available',
        );
      });

      it('should throw error when all elevators are in maintenance', () => {
        const elevators: Elevator[] = [
          createElevator({
            id: 'elevator-1',
            currentFloor: 1,
            status: ElevatorStatus.Maintenance,
          }),
          createElevator({
            id: 'elevator-2',
            currentFloor: 3,
            status: ElevatorStatus.Maintenance,
          }),
        ];

        const request: HallRequest = {
          floor: 5,
          direction: ElevatorDirection.Up,
        };

        expect(() =>
          service.assignElevatorToHallRequest(request, elevators),
        ).toThrow('No active elevators available');
      });

      it('should throw error when all elevators are in error state', () => {
        const elevators: Elevator[] = [
          createElevator({
            id: 'elevator-1',
            currentFloor: 1,
            status: ElevatorStatus.Error,
          }),
        ];

        const request: HallRequest = {
          floor: 5,
          direction: ElevatorDirection.Up,
        };

        expect(() =>
          service.assignElevatorToHallRequest(request, elevators),
        ).toThrow('No active elevators available');
      });
    });

    describe('single elevator scenarios', () => {
      it('should assign the only available elevator when idle', () => {
        const elevators: Elevator[] = [
          createElevator({
            id: 'elevator-1',
            currentFloor: 1,
            direction: ElevatorDirection.Idle,
          }),
        ];

        const request: HallRequest = {
          floor: 5,
          direction: ElevatorDirection.Up,
        };

        const result = service.assignElevatorToHallRequest(request, elevators);
        expect(result).toBe('elevator-1');
      });

      it('should assign the only active elevator even if others are in maintenance', () => {
        const elevators: Elevator[] = [
          createElevator({
            id: 'elevator-1',
            currentFloor: 1,
            status: ElevatorStatus.Active,
          }),
          createElevator({
            id: 'elevator-2',
            currentFloor: 3,
            status: ElevatorStatus.Maintenance,
          }),
        ];

        const request: HallRequest = {
          floor: 5,
          direction: ElevatorDirection.Up,
        };

        const result = service.assignElevatorToHallRequest(request, elevators);
        expect(result).toBe('elevator-1');
      });
    });

    describe('idle elevator selection', () => {
      it('should select the closest idle elevator', () => {
        const elevators: Elevator[] = [
          createElevator({
            id: 'elevator-1',
            currentFloor: 1,
            direction: ElevatorDirection.Idle,
          }),
          createElevator({
            id: 'elevator-2',
            currentFloor: 4,
            direction: ElevatorDirection.Idle,
          }),
          createElevator({
            id: 'elevator-3',
            currentFloor: 10,
            direction: ElevatorDirection.Idle,
          }),
        ];

        const request: HallRequest = {
          floor: 5,
          direction: ElevatorDirection.Up,
        };

        const result = service.assignElevatorToHallRequest(request, elevators);
        expect(result).toBe('elevator-2');
      });

      it('should select idle elevator on the same floor', () => {
        const elevators: Elevator[] = [
          createElevator({
            id: 'elevator-1',
            currentFloor: 1,
            direction: ElevatorDirection.Idle,
          }),
          createElevator({
            id: 'elevator-2',
            currentFloor: 5,
            direction: ElevatorDirection.Idle,
          }),
        ];

        const request: HallRequest = {
          floor: 5,
          direction: ElevatorDirection.Up,
        };

        const result = service.assignElevatorToHallRequest(request, elevators);
        expect(result).toBe('elevator-2');
      });
    });

    describe('same direction priority', () => {
      it('should prioritize elevator moving up in same direction over idle', () => {
        const elevators: Elevator[] = [
          createElevator({
            id: 'elevator-1',
            currentFloor: 10,
            direction: ElevatorDirection.Idle,
          }),
          createElevator({
            id: 'elevator-2',
            currentFloor: 3,
            direction: ElevatorDirection.Up,
            destinationFloors: [5, 7],
          }),
        ];

        const request: HallRequest = {
          floor: 6,
          direction: ElevatorDirection.Up,
        };

        const result = service.assignElevatorToHallRequest(request, elevators);
        expect(result).toBe('elevator-2');
      });

      it('should prioritize elevator moving down in same direction', () => {
        const elevators: Elevator[] = [
          createElevator({
            id: 'elevator-1',
            currentFloor: 1,
            direction: ElevatorDirection.Idle,
          }),
          createElevator({
            id: 'elevator-2',
            currentFloor: 10,
            direction: ElevatorDirection.Down,
            destinationFloors: [8, 5],
          }),
        ];

        const request: HallRequest = {
          floor: 6,
          direction: ElevatorDirection.Down,
        };

        const result = service.assignElevatorToHallRequest(request, elevators);
        expect(result).toBe('elevator-2');
      });

      it('should not select elevator moving up if request floor is behind', () => {
        const elevators: Elevator[] = [
          createElevator({
            id: 'elevator-1',
            currentFloor: 5,
            direction: ElevatorDirection.Idle,
          }),
          createElevator({
            id: 'elevator-2',
            currentFloor: 8,
            direction: ElevatorDirection.Up,
            destinationFloors: [10, 12],
          }),
        ];

        const request: HallRequest = {
          floor: 7,
          direction: ElevatorDirection.Up,
        };

        const result = service.assignElevatorToHallRequest(request, elevators);
        expect(result).toBe('elevator-1');
      });
    });

    describe('opposite direction handling', () => {
      it('should penalize elevator moving in opposite direction', () => {
        const elevators: Elevator[] = [
          createElevator({
            id: 'elevator-1',
            currentFloor: 8,
            direction: ElevatorDirection.Idle,
          }),
          createElevator({
            id: 'elevator-2',
            currentFloor: 3,
            direction: ElevatorDirection.Down,
            destinationFloors: [1],
          }),
        ];

        const request: HallRequest = {
          floor: 5,
          direction: ElevatorDirection.Up,
        };

        const result = service.assignElevatorToHallRequest(request, elevators);
        expect(result).toBe('elevator-1');
      });

      it('should select opposite direction elevator when it is the only option', () => {
        const elevators: Elevator[] = [
          createElevator({
            id: 'elevator-1',
            currentFloor: 10,
            direction: ElevatorDirection.Down,
            destinationFloors: [1],
          }),
        ];

        const request: HallRequest = {
          floor: 5,
          direction: ElevatorDirection.Up,
        };

        const result = service.assignElevatorToHallRequest(request, elevators);
        expect(result).toBe('elevator-1');
      });
    });

    describe('complex multi-elevator scenarios', () => {
      it('should select best elevator among multiple options with different states', () => {
        const elevators: Elevator[] = [
          createElevator({
            id: 'elevator-1',
            currentFloor: 1,
            direction: ElevatorDirection.Up,
            destinationFloors: [10, 15],
          }),
          createElevator({
            id: 'elevator-2',
            currentFloor: 8,
            direction: ElevatorDirection.Idle,
          }),
          createElevator({
            id: 'elevator-3',
            currentFloor: 3,
            direction: ElevatorDirection.Up,
            destinationFloors: [5, 9],
          }),
          createElevator({
            id: 'elevator-4',
            currentFloor: 12,
            direction: ElevatorDirection.Down,
            destinationFloors: [10, 5],
          }),
        ];

        const request: HallRequest = {
          floor: 7,
          direction: ElevatorDirection.Up,
        };

        const result = service.assignElevatorToHallRequest(request, elevators);
        expect(result).toBe('elevator-2');
      });

      it('should handle request for down direction', () => {
        const elevators: Elevator[] = [
          createElevator({
            id: 'elevator-1',
            currentFloor: 10,
            direction: ElevatorDirection.Down,
            destinationFloors: [5, 1],
          }),
          createElevator({
            id: 'elevator-2',
            currentFloor: 8,
            direction: ElevatorDirection.Down,
            destinationFloors: [6, 3],
          }),
          createElevator({
            id: 'elevator-3',
            currentFloor: 2,
            direction: ElevatorDirection.Idle,
          }),
        ];

        const request: HallRequest = {
          floor: 7,
          direction: ElevatorDirection.Down,
        };

        const result = service.assignElevatorToHallRequest(request, elevators);
        expect(result).toBe('elevator-2');
      });

      it('should handle elevator that needs to complete journey before serving request', () => {
        const elevators: Elevator[] = [
          createElevator({
            id: 'elevator-1',
            currentFloor: 8,
            direction: ElevatorDirection.Up,
            destinationFloors: [10, 12, 15],
          }),
          createElevator({
            id: 'elevator-2',
            currentFloor: 10,
            direction: ElevatorDirection.Idle,
          }),
        ];

        const request: HallRequest = {
          floor: 5,
          direction: ElevatorDirection.Up,
        };

        const result = service.assignElevatorToHallRequest(request, elevators);
        expect(result).toBe('elevator-2');
      });

      it('should prefer elevator that can immediately serve request in same direction', () => {
        const elevators: Elevator[] = [
          createElevator({
            id: 'elevator-1',
            currentFloor: 2,
            direction: ElevatorDirection.Up,
            destinationFloors: [4, 8, 10],
          }),
          createElevator({
            id: 'elevator-2',
            currentFloor: 7,
            direction: ElevatorDirection.Idle,
          }),
        ];

        const request: HallRequest = {
          floor: 6,
          direction: ElevatorDirection.Up,
        };

        const result = service.assignElevatorToHallRequest(request, elevators);
        expect(result).toBe('elevator-2');
      });

      it('should handle all elevators moving in opposite direction', () => {
        const elevators: Elevator[] = [
          createElevator({
            id: 'elevator-1',
            currentFloor: 10,
            direction: ElevatorDirection.Down,
            destinationFloors: [5, 1],
          }),
          createElevator({
            id: 'elevator-2',
            currentFloor: 8,
            direction: ElevatorDirection.Down,
            destinationFloors: [3],
          }),
        ];

        const request: HallRequest = {
          floor: 7,
          direction: ElevatorDirection.Up,
        };

        const result = service.assignElevatorToHallRequest(request, elevators);
        expect(result).toBe('elevator-2');
      });
    });

    describe('edge cases', () => {
      it('should handle request from ground floor', () => {
        const elevators: Elevator[] = [
          createElevator({
            id: 'elevator-1',
            currentFloor: 5,
            direction: ElevatorDirection.Idle,
          }),
        ];

        const request: HallRequest = {
          floor: 0,
          direction: ElevatorDirection.Up,
        };

        const result = service.assignElevatorToHallRequest(request, elevators);
        expect(result).toBe('elevator-1');
      });

      it('should handle request from top floor', () => {
        const elevators: Elevator[] = [
          createElevator({
            id: 'elevator-1',
            currentFloor: 5,
            direction: ElevatorDirection.Idle,
          }),
        ];

        const request: HallRequest = {
          floor: 20,
          direction: ElevatorDirection.Down,
        };

        const result = service.assignElevatorToHallRequest(request, elevators);
        expect(result).toBe('elevator-1');
      });

      it('should handle elevator with empty destination floors when idle', () => {
        const elevators: Elevator[] = [
          createElevator({
            id: 'elevator-1',
            currentFloor: 5,
            direction: ElevatorDirection.Idle,
            destinationFloors: [],
          }),
        ];

        const request: HallRequest = {
          floor: 8,
          direction: ElevatorDirection.Up,
        };

        const result = service.assignElevatorToHallRequest(request, elevators);
        expect(result).toBe('elevator-1');
      });

      it('should handle multiple elevators at same floor with same score', () => {
        const elevators: Elevator[] = [
          createElevator({
            id: 'elevator-1',
            currentFloor: 5,
            direction: ElevatorDirection.Idle,
          }),
          createElevator({
            id: 'elevator-2',
            currentFloor: 5,
            direction: ElevatorDirection.Idle,
          }),
        ];

        const request: HallRequest = {
          floor: 8,
          direction: ElevatorDirection.Up,
        };

        const result = service.assignElevatorToHallRequest(request, elevators);
        expect(result).toBe('elevator-1');
      });
    });

    describe('negative floors (underground/basement)', () => {
      it('should handle request from negative floor going up', () => {
        const elevators: Elevator[] = [
          createElevator({
            id: 'elevator-1',
            currentFloor: 0,
            direction: ElevatorDirection.Idle,
          }),
          createElevator({
            id: 'elevator-2',
            currentFloor: -3,
            direction: ElevatorDirection.Idle,
          }),
        ];

        const request: HallRequest = {
          floor: -2,
          direction: ElevatorDirection.Up,
        };

        const result = service.assignElevatorToHallRequest(request, elevators);
        expect(result).toBe('elevator-2'); // Floor -3 is closer to -2 (distance 1) than floor 0 (distance 2)
      });

      it('should handle request from negative floor going down', () => {
        const elevators: Elevator[] = [
          createElevator({
            id: 'elevator-1',
            currentFloor: -1,
            direction: ElevatorDirection.Idle,
          }),
          createElevator({
            id: 'elevator-2',
            currentFloor: -5,
            direction: ElevatorDirection.Idle,
          }),
        ];

        const request: HallRequest = {
          floor: -3,
          direction: ElevatorDirection.Down,
        };

        const result = service.assignElevatorToHallRequest(request, elevators);
        expect(result).toBe('elevator-1'); // Floor -1 is closer to -3 (distance 2) than floor -5 (distance 2), but -1 appears first
      });

      it('should handle elevator at negative floor responding to positive floor request', () => {
        const elevators: Elevator[] = [
          createElevator({
            id: 'elevator-1',
            currentFloor: -2,
            direction: ElevatorDirection.Idle,
          }),
          createElevator({
            id: 'elevator-2',
            currentFloor: 10,
            direction: ElevatorDirection.Idle,
          }),
        ];

        const request: HallRequest = {
          floor: 3,
          direction: ElevatorDirection.Up,
        };

        const result = service.assignElevatorToHallRequest(request, elevators);
        expect(result).toBe('elevator-1'); // Floor -2 to 3 is distance 5, floor 10 to 3 is distance 7
      });

      it('should handle elevator moving down through negative floors', () => {
        const elevators: Elevator[] = [
          createElevator({
            id: 'elevator-1',
            currentFloor: 2,
            direction: ElevatorDirection.Down,
            destinationFloors: [0, -2],
          }),
          createElevator({
            id: 'elevator-2',
            currentFloor: 5,
            direction: ElevatorDirection.Idle,
          }),
        ];

        const request: HallRequest = {
          floor: -1,
          direction: ElevatorDirection.Down,
        };

        const result = service.assignElevatorToHallRequest(request, elevators);
        expect(result).toBe('elevator-1'); // Moving down, can pick up at -1 (distance 3) vs idle at 5 (distance 6)
      });

      it('should handle elevator moving up from negative floors', () => {
        const elevators: Elevator[] = [
          createElevator({
            id: 'elevator-1',
            currentFloor: -3,
            direction: ElevatorDirection.Up,
            destinationFloors: [-1, 2, 5],
          }),
          createElevator({
            id: 'elevator-2',
            currentFloor: 3,
            direction: ElevatorDirection.Idle,
          }),
        ];

        const request: HallRequest = {
          floor: 0,
          direction: ElevatorDirection.Up,
        };

        const result = service.assignElevatorToHallRequest(request, elevators);
        expect(result).toBe('elevator-1'); // Moving up from -3, can pick up at 0 (distance 3) vs idle at 3 (distance 3), first wins
      });

      it('should calculate correct distance between negative floors', () => {
        const elevators: Elevator[] = [
          createElevator({
            id: 'elevator-1',
            currentFloor: -5,
            direction: ElevatorDirection.Idle,
          }),
          createElevator({
            id: 'elevator-2',
            currentFloor: -1,
            direction: ElevatorDirection.Idle,
          }),
          createElevator({
            id: 'elevator-3',
            currentFloor: 0,
            direction: ElevatorDirection.Idle,
          }),
        ];

        const request: HallRequest = {
          floor: -3,
          direction: ElevatorDirection.Up,
        };

        const result = service.assignElevatorToHallRequest(request, elevators);
        expect(result).toBe('elevator-1'); // Distance: -5 to -3 = 2, -1 to -3 = 2, 0 to -3 = 3, first with min wins
      });

      it('should handle elevator moving down from positive to negative floors', () => {
        const elevators: Elevator[] = [
          createElevator({
            id: 'elevator-1',
            currentFloor: 5,
            direction: ElevatorDirection.Down,
            destinationFloors: [2, 0, -2],
          }),
        ];

        const request: HallRequest = {
          floor: -4,
          direction: ElevatorDirection.Down,
        };

        const result = service.assignElevatorToHallRequest(request, elevators);
        expect(result).toBe('elevator-1'); // Will complete journey to -2, then continue to -4
      });

      it('should handle request at lowest basement level', () => {
        const elevators: Elevator[] = [
          createElevator({
            id: 'elevator-1',
            currentFloor: 0,
            direction: ElevatorDirection.Idle,
          }),
          createElevator({
            id: 'elevator-2',
            currentFloor: -3,
            direction: ElevatorDirection.Idle,
          }),
        ];

        const request: HallRequest = {
          floor: -5,
          direction: ElevatorDirection.Up,
        };

        const result = service.assignElevatorToHallRequest(request, elevators);
        expect(result).toBe('elevator-2'); // Floor -3 is closer to -5 (distance 2) than floor 0 (distance 5)
      });

      it('should handle elevator at negative floor with request behind', () => {
        const elevators: Elevator[] = [
          createElevator({
            id: 'elevator-1',
            currentFloor: -2,
            direction: ElevatorDirection.Up,
            destinationFloors: [0, 3],
          }),
        ];

        const request: HallRequest = {
          floor: -4,
          direction: ElevatorDirection.Up,
        };

        const result = service.assignElevatorToHallRequest(request, elevators);
        expect(result).toBe('elevator-1'); // Will go to 3, then come back to -4
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
