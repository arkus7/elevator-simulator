import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ElevatorId } from './elevator.interface';
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

@Injectable()
export class ElevatorEventEmitterService {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  public destinationScheduled(
    elevatorId: ElevatorId,
    destination: number,
  ): void {
    this.eventEmitter.emit(
      ElevatorEvent.Destination.Scheduled,
      new ElevatorDestinationScheduledEvent(elevatorId, destination),
    );
  }

  public floorReached(elevatorId: ElevatorId, floor: number): void {
    this.eventEmitter.emit(
      ElevatorEvent.Motion.FloorReached,
      new ElevatorFloorReachedEvent(elevatorId, floor),
    );
  }

  public destinationReached(elevatorId: ElevatorId, destination: number): void {
    this.eventEmitter.emit(
      ElevatorEvent.Destination.Reached,
      new ElevatorDestinationReachedEvent(elevatorId, destination),
    );
  }

  public doorOpening(elevatorId: ElevatorId): void {
    this.eventEmitter.emit(
      ElevatorEvent.Door.Opening,
      new ElevatorDoorOpeningEvent(elevatorId),
    );
  }

  public doorOpened(elevatorId: ElevatorId): void {
    this.eventEmitter.emit(
      ElevatorEvent.Door.Opened,
      new ElevatorDoorOpenedEvent(elevatorId),
    );
  }

  public doorClosing(elevatorId: ElevatorId): void {
    this.eventEmitter.emit(
      ElevatorEvent.Door.Closing,
      new ElevatorDoorClosingEvent(elevatorId),
    );
  }

  public doorClosed(elevatorId: ElevatorId): void {
    this.eventEmitter.emit(
      ElevatorEvent.Door.Closed,
      new ElevatorDoorClosedEvent(elevatorId),
    );
  }
}
