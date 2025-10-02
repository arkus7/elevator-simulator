import { Injectable, Logger } from '@nestjs/common';
import type { ConfigContainer } from '@unifig/core';
import { InjectConfig } from '@unifig/nest';
import { AppConfig } from '../../config/app.config';
import {
  ElevatorFloorReachedEvent,
  ElevatorDestinationScheduledEvent,
  ElevatorEvent,
  ElevatorDestinationReachedEvent,
  ElevatorDoorClosedEvent,
} from '../../elevator/elevator-event';
import { OnEvent } from '@nestjs/event-emitter';
import { ElevatorRegistryService } from '../../elevator-registry/elevator-registry.service';
import {
  Elevator,
  ElevatorDirection,
  ElevatorId,
  ElevatorMotionState,
} from '../../elevator/elevator.interface';
import { BuildingService } from '../../building/building.service';
import { ElevatorEventEmitterService } from '../../elevator/elevator-event-emitter.service';

@Injectable()
export class MotionSimulationService {
  private readonly logger = new Logger(MotionSimulationService.name, {
    timestamp: true,
  });
  private motionTimeouts: Map<ElevatorId, NodeJS.Timeout> = new Map();

  public constructor(
    @InjectConfig(AppConfig)
    private readonly config: ConfigContainer<AppConfig>,
    private readonly elevatorRegistryService: ElevatorRegistryService,
    private readonly elevatorEventEmitter: ElevatorEventEmitterService,
    private readonly buildingService: BuildingService,
  ) {}

  // @OnEvent(ElevatorEvent.Motion.Moving)
  // public onMoving() {
  //     this.logger.log(`Elevator ${elevator.id} is moving`);
  // }

  @OnEvent(ElevatorEvent.Destination.Scheduled)
  public onDestinationScheduled(event: ElevatorDestinationScheduledEvent) {
    this.logger.log(
      `Elevator ${event.elevatorId} destination scheduled: ${event.destination}`,
    );

    const elevator = this.elevatorRegistryService.get(event.elevatorId);
    if (!elevator) {
      this.logger.error(`Elevator ${event.elevatorId} not found`);
      return;
    }

    if (elevator.currentFloor === event.destination) {
      this.logger.error(
        `Elevator ${event.elevatorId} destination is the same as current floor: ${event.destination}`,
      );
      this.elevatorEventEmitter.destinationReached(
        elevator.id,
        event.destination,
      );
      return;
    }

    if (elevator.motionState === ElevatorMotionState.Idle) {
      this.startMoving(elevator);
    }
  }

  @OnEvent(ElevatorEvent.Motion.FloorReached)
  public onFloorReached(event: ElevatorFloorReachedEvent) {
    this.logger.log(
      `Elevator ${event.elevatorId} reached floor: ${event.floor}`,
    );

    const elevator = this.elevatorRegistryService.get(event.elevatorId);
    if (!elevator) {
      this.logger.error(`Elevator ${event.elevatorId} not found`);
      return;
    }

    elevator.currentFloor = event.floor;
    if (elevator.destinationFloors[0] === event.floor) {
      // reached the target floor
      this.elevatorEventEmitter.destinationReached(elevator.id, event.floor);
    } else {
      this.startMoving(elevator);
    }
  }

  @OnEvent(ElevatorEvent.Destination.Reached)
  public onDestinationReached(event: ElevatorDestinationReachedEvent) {
    this.logger.log(
      `Elevator ${event.elevatorId} reached destination: ${event.destination}`,
    );

    const elevator = this.elevatorRegistryService.get(event.elevatorId);
    if (!elevator) {
      this.logger.error(`Elevator ${event.elevatorId} not found`);
      return;
    }

    elevator.motionState = ElevatorMotionState.Stopped;
    elevator.destinationFloors.shift();
    // TODO: motion stopped event
  }

  @OnEvent(ElevatorEvent.Door.Closed)
  public onDoorClosed(event: ElevatorDoorClosedEvent) {
    this.logger.log(`Elevator ${event.elevatorId} doors closed`);

    const elevator = this.elevatorRegistryService.get(event.elevatorId);
    if (!elevator) {
      this.logger.error(`Elevator ${event.elevatorId} not found`);
      return;
    }

    this.startMoving(elevator);
  }

  private startMoving(elevator: Elevator): void {
    const targetFloor = elevator.destinationFloors[0];
    if (targetFloor === undefined) {
      this.logger.error(`Elevator ${elevator.id} has no destination floors`);
      this.becomeIdle(elevator);
      return;
    }

    elevator.motionState = ElevatorMotionState.Moving;
    elevator.direction =
      targetFloor > elevator.currentFloor
        ? ElevatorDirection.Up
        : ElevatorDirection.Down;
    const nextFloor =
      elevator.direction === ElevatorDirection.Up
        ? elevator.currentFloor + 1
        : elevator.currentFloor - 1;

    if (!this.buildingService.isValidFloor(nextFloor)) {
      this.logger.error(
        `Elevator ${elevator.id} tried to move to invalid floor: ${nextFloor}`,
      );
      this.becomeIdle(elevator);
      return;
    }

    this.logger.log(
      `Elevator ${elevator.id} started moving towards ${targetFloor}`,
    );
    // TODO: motion moving event

    this.motionTimeouts.set(
      elevator.id,
      setTimeout(() => {
        this.logger.log(`Elevator ${elevator.id} reached ${nextFloor}`);
        this.motionTimeouts.delete(elevator.id);
        this.elevatorEventEmitter.floorReached(elevator.id, nextFloor);
      }, this.config.values.floorTravelTimeMs),
    );
  }

  private becomeIdle(elevator: Elevator): void {
    elevator.motionState = ElevatorMotionState.Idle;
    elevator.direction = ElevatorDirection.Idle;
    this.motionTimeouts.delete(elevator.id);
    // TODO: motion idle event
    // this.eventEmitter.emit(ElevatorEvent.Motion.Idle, new ElevatorIdleEvent(elevator.id));
  }
}
