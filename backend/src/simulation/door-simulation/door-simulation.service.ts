import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import type { ConfigContainer } from '@unifig/core';
import { InjectConfig } from '@unifig/nest';
import { AppConfig } from '../../config/app.config';
import { ElevatorRegistryService } from '../../elevator-registry/elevator-registry.service';
import {
  ElevatorDestinationReachedEvent,
  ElevatorDoorClosedEvent,
  ElevatorDoorClosingEvent,
  ElevatorDoorOpenedEvent,
  ElevatorEvent,
} from '../../elevator/elevator-event';
import { ElevatorDoorState, ElevatorId } from '../../elevator/elevator.interface';
import { ElevatorEventEmitterService } from '../../elevator/elevator-event-emitter.service';

@Injectable()
export class DoorSimulationService {
  private readonly logger = new Logger(DoorSimulationService.name, {
    timestamp: true,
  });
  private doorTimeouts: Map<ElevatorId, NodeJS.Timeout> = new Map();

  public constructor(
    @InjectConfig(AppConfig)
    private readonly config: ConfigContainer<AppConfig>,
    private readonly elevatorEventEmitter: ElevatorEventEmitterService,
    private readonly elevatorRegistryService: ElevatorRegistryService,
  ) {}

  @OnEvent(ElevatorEvent.Destination.Reached)
  public onDestinationReached(event: ElevatorDestinationReachedEvent) {
    this.logger.log(
      `Elevator ${event.elevatorId} reached destination: ${event.destination}, opening doors`,
    );

    const elevator = this.elevatorRegistryService.get(event.elevatorId);
    if (!elevator) {
      this.logger.error(`Elevator ${event.elevatorId} not found`);
      return;
    }

    elevator.doorState = ElevatorDoorState.Opening;
    this.doorTimeouts.set(
      elevator.id,
      setTimeout(() => {
        elevator.doorState = ElevatorDoorState.Open;
        this.elevatorEventEmitter.doorOpened(elevator.id);
      }, this.config.values.doorOpenCloseTimeMs),
    );
  }

  @OnEvent(ElevatorEvent.Door.Opened)
  public onDoorOpened(event: ElevatorDoorOpenedEvent) {
    this.logger.log(`Elevator ${event.elevatorId} doors opened`);

    const elevator = this.elevatorRegistryService.get(event.elevatorId);
    if (!elevator) {
      this.logger.error(`Elevator ${event.elevatorId} not found`);
      return;
    }

    this.doorTimeouts.set(
      elevator.id,
      setTimeout(() => {
        elevator.doorState = ElevatorDoorState.Closing;
        this.elevatorEventEmitter.doorClosing(elevator.id);
      }, this.config.values.doorHoldTimeMs),
    );
  }

  @OnEvent(ElevatorEvent.Door.Closing)
  public onDoorClosing(event: ElevatorDoorClosingEvent) {
    this.logger.log(`Elevator ${event.elevatorId} doors closing`);

    const elevator = this.elevatorRegistryService.get(event.elevatorId);
    if (!elevator) {
      this.logger.error(`Elevator ${event.elevatorId} not found`);
      return;
    }

    this.doorTimeouts.set(
      elevator.id,
      setTimeout(() => {
        elevator.doorState = ElevatorDoorState.Closed;
        this.elevatorEventEmitter.doorClosed(elevator.id);
      }, this.config.values.doorOpenCloseTimeMs),
    );
  }

  @OnEvent(ElevatorEvent.Door.Closed)
  public onDoorClosed(event: ElevatorDoorClosedEvent) {
    this.logger.log(`Elevator ${event.elevatorId} doors closed`);

    const elevator = this.elevatorRegistryService.get(event.elevatorId);
    if (!elevator) {
      this.logger.error(`Elevator ${event.elevatorId} not found`);
      return;
    }

    elevator.doorState = ElevatorDoorState.Closed;
    this.doorTimeouts.delete(elevator.id);
  }
}
