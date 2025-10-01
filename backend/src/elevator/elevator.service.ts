import { Injectable } from '@nestjs/common';
import {
  Elevator,
  ElevatorDirection,
  ElevatorDoorState,
  ElevatorId,
  ElevatorMotionState,
  ElevatorStatus,
} from './elevator.interface';
import { v4 as uuidV4 } from 'uuid';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class ElevatorService {
  public constructor(private readonly eventEmitter: EventEmitter2) {}

  /**
   * Target floor of the elevator to which the elevator is moving, null if the elevator is idle
   */
  public getTargetFloor(elevator: Elevator): number | null {
    return elevator.destinationFloors[0] ?? null;
  }

  public scheduleCarRequest(elevator: Elevator, floor: number): boolean {
    if (elevator.status !== ElevatorStatus.Active) {
      return false;
    }

    if (elevator.destinationFloors.includes(floor)) {
      return true;
    }

    elevator.destinationFloors.push(floor);
    elevator.destinationFloors = this.sortDestinations({
      destinations: elevator.destinationFloors,
      currentFloor: elevator.currentFloor,
      direction: elevator.direction,
    });

    // TODO: Emit event about internal request scheduled

    return true;
  }

  private sortDestinations({
    destinations,
    currentFloor,
    direction,
  }: {
    destinations: number[];
    currentFloor: number;
    direction: ElevatorDirection;
  }): number[] {
    if (direction === ElevatorDirection.Idle) {
      // sort by proximity to current floor
      return destinations.sort(
        (a, b) => Math.abs(a - currentFloor) - Math.abs(b - currentFloor),
      );
    }

    const floorsAbove = destinations
      .filter((f) => f >= currentFloor)
      .sort((a, b) => a - b);
    const floorsBelow = destinations
      .filter((f) => f < currentFloor)
      .sort((a, b) => b - a);

    if (direction === ElevatorDirection.Up) {
      return [...floorsAbove, ...floorsBelow];
    } else {
      return [...floorsBelow, ...floorsAbove];
    }
  }
}
