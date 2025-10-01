import { Test, TestingModule } from '@nestjs/testing';
import { ElevatorCreationService } from './elevator-creation.service';
import {
  ElevatorDirection,
  ElevatorDoorState,
  ElevatorMotionState,
  ElevatorStatus,
} from '../../elevator/elevator.interface';

describe('ElevatorCreationService', () => {
  let service: ElevatorCreationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ElevatorCreationService],
    }).compile();

    service = module.get<ElevatorCreationService>(ElevatorCreationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('#createElevator', () => {
    it('should generate a unique id', () => {
      const elevator = ElevatorCreationService.createElevator();
      expect(elevator.id).toBeDefined();
      expect(elevator.id).not.toBe(ElevatorCreationService.createElevator().id);
    });

    it('should set the current floor to 0', () => {
      const elevator = ElevatorCreationService.createElevator();
      expect(elevator.currentFloor).toBe(0);
    });

    it('should set the direction to idle', () => {
      const elevator = ElevatorCreationService.createElevator();
      expect(elevator.direction).toBe(ElevatorDirection.Idle);
    });

    it('should set the door state to closed', () => {
      const elevator = ElevatorCreationService.createElevator();
      expect(elevator.doorState).toBe(ElevatorDoorState.Closed);
    });

    it('should set the destination floors to an empty array', () => {
      const elevator = ElevatorCreationService.createElevator();
      expect(elevator.destinationFloors).toEqual([]);
    });

    it('should set the motion state to idle', () => {
      const elevator = ElevatorCreationService.createElevator();
      expect(elevator.motionState).toBe(ElevatorMotionState.Idle);
    });

    it('should set the status to active', () => {
      const elevator = ElevatorCreationService.createElevator();
      expect(elevator.status).toBe(ElevatorStatus.Active);
    });

    describe('creating more than 26 elevators', () => {
      beforeEach(() => {
        // reset the id counter for the tests
        (ElevatorCreationService as any).idCounter = 0;
      });

      it('should generate a unique id after Z', () => {
        for (let i = 0; i < 26; i++) {
          ElevatorCreationService.createElevator();
        }
        const elevator = ElevatorCreationService.createElevator();
        expect(elevator.id).toBeDefined();
        expect(elevator.id).toBe('AA');
      });
    });
  });
});
