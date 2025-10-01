import {
  Elevator,
  ElevatorDirection,
  ElevatorDoorState,
  ElevatorId,
  ElevatorMotionState,
  ElevatorStatus,
} from '../../elevator/elevator.interface';
import { v4 as uuidV4 } from 'uuid';

export class ElevatorCreationService {
  private static idCounter = 0;

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

  /**
   * Generates a unique ID for the elevator from A to Z.
   * The IDs are generated in order, so the first elevator will have ID A, the second will have ID B, and so on.
   * If the IDs reach Z, the next elevator will have ID AA, the next will have ID AB, and so on.
   *
   * @returns The ID of the elevator
   */
  private static generateElevatorId(): ElevatorId {
    const counter = this.idCounter++;
    let id = '';
    let num = counter;

    while (num >= 0) {
      id = String.fromCharCode(65 + (num % 26)) + id;
      num = Math.floor(num / 26) - 1;
    }

    return id;
  }
}
