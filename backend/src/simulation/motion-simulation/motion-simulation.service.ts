import { Injectable, Logger } from '@nestjs/common';
import type { ConfigContainer } from '@unifig/core';
import { InjectConfig } from '@unifig/nest';
import { AppConfig } from '../../config/app.config';
import {
  ElevatorFloorReachedEvent,
  ElevatorEvent,
  ElevatorMotionMovingEvent,
  ElevatorMotionStoppedEvent,
  ElevatorMotionIdleEvent,
} from '../../elevator/elevator-event';
import { OnEvent } from '@nestjs/event-emitter';
import { ElevatorRegistryService } from '../../elevator-registry/elevator-registry.service';
import { Elevator, ElevatorId } from '../../elevator/elevator.interface';
import { ElevatorService } from '../../elevator/elevator.service';

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
    private readonly elevatorService: ElevatorService,
  ) {}

  @OnEvent(ElevatorEvent.Motion.Moving)
  public onMotionMoving(event: ElevatorMotionMovingEvent) {
    this.logger.log(
      `Elevator ${event.elevatorId} motion moving ${event.direction}`,
    );

    const elevator = this.getElevator(event.elevatorId);

    this.motionTimeouts.set(
      elevator.id,
      setTimeout(() => {
        this.motionTimeouts.delete(elevator.id);
        this.elevatorService.reachedFloor(elevator);
      }, this.config.values.floorTravelTimeMs),
    );
  }

  @OnEvent(ElevatorEvent.Motion.Stopped)
  public onMotionStopped(event: ElevatorMotionStoppedEvent) {
    this.logger.log(`Elevator ${event.elevatorId} motion stopped`);
  }

  @OnEvent(ElevatorEvent.Motion.FloorReached)
  public onFloorReached(event: ElevatorFloorReachedEvent) {
    this.logger.log(
      `Elevator ${event.elevatorId} floor reached: ${event.floor}`,
    );
  }

  @OnEvent(ElevatorEvent.Motion.Idle)
  public onMotionIdle(event: ElevatorMotionIdleEvent) {
    this.logger.log(`Elevator ${event.elevatorId} motion idle`);
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
