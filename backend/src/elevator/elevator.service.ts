import { Injectable } from '@nestjs/common';
import {
  Elevator,
  ElevatorDirection,
  ElevatorStatus,
} from './elevator.interface';
import { ElevatorEventEmitterService } from './elevator-event-emitter.service';

@Injectable()
export class ElevatorService {
  public constructor(
    private readonly elevatorEventEmitter: ElevatorEventEmitterService,
  ) {}

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

    this.elevatorEventEmitter.destinationScheduled(elevator.id, floor);

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
