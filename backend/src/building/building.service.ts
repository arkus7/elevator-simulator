import { Injectable, Logger } from '@nestjs/common';
import type { ConfigContainer } from '@unifig/core';
import { InjectConfig } from '@unifig/nest';
import { BuildingConfig } from '../config/building.config';
import { Elevator, ElevatorId } from '../elevator/elevator.interface';
import { ElevatorCreationService } from '../elevator/elevator-creation/elevator-creation.service';

@Injectable()
export class BuildingService {
  private readonly logger = new Logger(BuildingService.name);
  private readonly elevators: Map<ElevatorId, Elevator> = new Map();

  public constructor(
    @InjectConfig(BuildingConfig)
    private readonly config: ConfigContainer<BuildingConfig>,
  ) {}

  public initializeElevators(): void {
    if (this.elevators.size > 0) {
      this.logger.warn('Elevators already initialized');
      return;
    }

    this.logger.debug(`Initializing ${this.config.values.elevatorCount} elevators`);

    for (let i = 0; i < this.config.values.elevatorCount; i++) {
      const elevator = ElevatorCreationService.createElevator();
      this.elevators.set(elevator.id, elevator);
    }

    this.logger.debug(`Initialized ${this.elevators.size} elevators`);
  }

  public getElevator(id: ElevatorId): Elevator | undefined {
    return this.elevators.get(id);
  }
}
