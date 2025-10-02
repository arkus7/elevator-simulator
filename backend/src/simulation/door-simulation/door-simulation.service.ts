import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import type { ConfigContainer } from '@unifig/core';
import { InjectConfig } from '@unifig/nest';
import { AppConfig } from '../../config/app.config';
import { ElevatorRegistryService } from '../../elevator-registry/elevator-registry.service';
import {
  ElevatorDoorClosedEvent,
  ElevatorDoorClosingEvent,
  ElevatorDoorOpenedEvent,
  ElevatorDoorOpeningEvent,
  ElevatorEvent,
} from '../../elevator/elevator-event';
import { Elevator, ElevatorId } from '../../elevator/elevator.interface';
import { ElevatorService } from '../../elevator/elevator.service';

@Injectable()
export class DoorSimulationService {
  private readonly logger = new Logger(DoorSimulationService.name, {
    timestamp: true,
  });
  private doorTimeouts: Map<ElevatorId, NodeJS.Timeout> = new Map();

  public constructor(
    @InjectConfig(AppConfig)
    private readonly config: ConfigContainer<AppConfig>,
    private readonly elevatorRegistryService: ElevatorRegistryService,
    private readonly elevatorService: ElevatorService,
  ) {}

  @OnEvent(ElevatorEvent.Door.Opening)
  public onDoorOpening(event: ElevatorDoorOpeningEvent) {
    this.logger.log(`Elevator ${event.elevatorId} doors opening`);

    const elevator = this.getElevator(event.elevatorId);

    clearTimeout(this.doorTimeouts.get(elevator.id));
    this.doorTimeouts.set(
      elevator.id,
      setTimeout(() => {
        this.doorTimeouts.delete(elevator.id);
        this.elevatorService.completeOpeningDoor(elevator);
      }, this.config.values.doorOpenCloseTimeMs),
    );
  }

  @OnEvent(ElevatorEvent.Door.Opened)
  public onDoorOpened(event: ElevatorDoorOpenedEvent) {
    this.logger.log(`Elevator ${event.elevatorId} doors opened`);

    const elevator = this.getElevator(event.elevatorId);

    clearTimeout(this.doorTimeouts.get(elevator.id));
    this.doorTimeouts.set(
      elevator.id,
      setTimeout(() => {
        this.doorTimeouts.delete(elevator.id);
        this.elevatorService.startClosingDoor(elevator);
      }, this.config.values.doorHoldTimeMs),
    );
  }

  @OnEvent(ElevatorEvent.Door.Closing)
  public onDoorClosing(event: ElevatorDoorClosingEvent) {
    this.logger.log(`Elevator ${event.elevatorId} doors closing`);

    const elevator = this.getElevator(event.elevatorId);

    clearTimeout(this.doorTimeouts.get(elevator.id));
    this.doorTimeouts.set(
      elevator.id,
      setTimeout(() => {
        this.doorTimeouts.delete(elevator.id);
        this.elevatorService.completeClosingDoor(elevator);
      }, this.config.values.doorOpenCloseTimeMs),
    );
  }

  @OnEvent(ElevatorEvent.Door.Closed)
  public onDoorClosed(event: ElevatorDoorClosedEvent) {
    this.logger.log(`Elevator ${event.elevatorId} doors closed`);
  }

  private getElevator(elevatorId: ElevatorId): Elevator {
    const elevator = this.elevatorRegistryService.get(elevatorId);
    if (!elevator) {
      this.logger.error(`Elevator ${elevatorId} not found`);
      throw new Error(`Elevator ${elevatorId} not found`);
    }
    return elevator;
  }
}
