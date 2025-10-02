import { BadRequestException, Injectable } from '@nestjs/common';
import {
  Elevator,
  ElevatorDirection,
  ElevatorDoorState,
  ElevatorMotionState,
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

  public scheduleCarRequest(elevator: Elevator, floor: number): void {
    this.guardIsOperational(elevator);

    if (elevator.destinationFloors.includes(floor)) {
      return;
    }

    elevator.destinationFloors.push(floor);
    elevator.destinationFloors = this.sortDestinations({
      destinations: elevator.destinationFloors,
      currentFloor: elevator.currentFloor,
      direction: elevator.direction,
    });

    this.elevatorEventEmitter.destinationScheduled(
      elevator.id,
      floor,
      elevator.destinationFloors,
    );

    if (elevator.motionState === ElevatorMotionState.Idle) {
      this.startMoving(elevator);
    }
  }

  public startOpeningDoor(elevator: Elevator): void {
    this.guardIsOperational(elevator);
    if (elevator.motionState === ElevatorMotionState.Moving) {
      throw new BadRequestException('Cannot open door while moving');
    }

    if (
      elevator.doorState !== ElevatorDoorState.Closed &&
      elevator.doorState !== ElevatorDoorState.Closing
    ) {
      throw new BadRequestException(
        'Cannot open door while doors are not closed or closing',
      );
    }

    elevator.doorState = ElevatorDoorState.Opening;
    this.elevatorEventEmitter.doorOpening(elevator.id);
  }

  public completeOpeningDoor(elevator: Elevator): void {
    if (elevator.doorState !== ElevatorDoorState.Opening) {
      return;
    }

    elevator.doorState = ElevatorDoorState.Open;
    this.elevatorEventEmitter.doorOpened(elevator.id);
  }

  public startClosingDoor(elevator: Elevator): void {
    this.guardIsOperational(elevator);

    if (elevator.doorState !== ElevatorDoorState.Open) {
      throw new BadRequestException(
        'Cannot close door while doors are not open',
      );
    }

    elevator.doorState = ElevatorDoorState.Closing;
    this.elevatorEventEmitter.doorClosing(elevator.id);
  }

  public completeClosingDoor(elevator: Elevator): void {
    if (elevator.doorState !== ElevatorDoorState.Closing) {
      return;
    }
    elevator.doorState = ElevatorDoorState.Closed;
    this.elevatorEventEmitter.doorClosed(elevator.id);

    this.startMoving(elevator);
  }

  public startMoving(elevator: Elevator): void {
    this.guardIsOperational(elevator);
    
    if (elevator.doorState !== ElevatorDoorState.Closed) {
      return;
    }

    if (this.checkForError(elevator)) {
      return;
    }

    if (elevator.destinationFloors.length === 0) {
      this.becomeIdle(elevator);
      return;
    }

    const targetFloor = elevator.destinationFloors[0];
    if (targetFloor > elevator.currentFloor) {
      elevator.direction = ElevatorDirection.Up;
    } else if (targetFloor < elevator.currentFloor) {
      elevator.direction = ElevatorDirection.Down;
    } else {
      // Already at destination
      this.reachedDestination(elevator);
      return;
    }

    elevator.motionState = ElevatorMotionState.Moving;
    this.elevatorEventEmitter.motionMoving(elevator.id, elevator.direction);
  }

  public reachedFloor(elevator: Elevator): void {
    if (elevator.motionState !== ElevatorMotionState.Moving) {
      return;
    }

    // Move one floor
    if (elevator.direction === ElevatorDirection.Up) {
      elevator.currentFloor++;
    } else if (elevator.direction === ElevatorDirection.Down) {
      elevator.currentFloor--;
    }

    this.elevatorEventEmitter.floorReached(elevator.id, elevator.currentFloor);

    if (elevator.currentFloor === elevator.destinationFloors[0]) {
      this.reachedDestination(elevator);
    } else {
      this.startMoving(elevator);
    }
  }

  private reachedDestination(elevator: Elevator): void {
    elevator.motionState = ElevatorMotionState.Stopped;
    this.elevatorEventEmitter.motionStopped(elevator.id);

    const floor = elevator.destinationFloors.shift()!;
    this.elevatorEventEmitter.destinationReached(elevator.id, floor);

    this.startOpeningDoor(elevator);
  }

  private becomeIdle(elevator: Elevator): void {
    elevator.motionState = ElevatorMotionState.Idle;
    elevator.direction = ElevatorDirection.Idle;
    this.elevatorEventEmitter.motionIdle(elevator.id);
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

  private checkForError(elevator: Elevator): boolean {
    if (Math.random() < elevator.errorRate) {
      elevator.status = ElevatorStatus.Error;
      elevator.motionState = ElevatorMotionState.Idle;
      elevator.direction = ElevatorDirection.Idle;
      elevator.doorState = ElevatorDoorState.Closed;
      elevator.destinationFloors = [];
      this.elevatorEventEmitter.statusError(elevator.id);
      return true;
    }
    return false;
  }

  public startMaintenance(elevator: Elevator): void {
    elevator.status = ElevatorStatus.Maintenance;
    this.elevatorEventEmitter.statusMaintenance(elevator.id);
  }

  public completeMaintenance(elevator: Elevator): void {
    elevator.destinationFloors = [0];
    elevator.status = ElevatorStatus.Active;
    this.elevatorEventEmitter.statusActive(elevator.id);
    this.startMoving(elevator);
  }

  private guardIsOperational(elevator: Elevator): void {
    if (elevator.status !== ElevatorStatus.Active) {
      throw new BadRequestException('Elevator is not operational');
    }
  }
}
