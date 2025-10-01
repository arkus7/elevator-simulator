import { Elevator, ElevatorDirection, ElevatorDoorState, ElevatorId, ElevatorMotionState, ElevatorStatus } from '../elevator.interface';
import { v4 as uuidV4 } from 'uuid';

export class ElevatorCreationService {
    public static createElevator(): Elevator {
        return {
          id: this.generateElevatorId(),
          currentFloor: 0,
          direction: ElevatorDirection.Idle,
          doorState: ElevatorDoorState.Closed,
          motionState: ElevatorMotionState.Idle,
          status: ElevatorStatus.Active,
          destinationFloors: [],
        };
      }


  private static generateElevatorId(): ElevatorId {
    return uuidV4() as ElevatorId;
  }
}
