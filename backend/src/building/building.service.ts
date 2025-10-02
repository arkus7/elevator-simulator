import { Injectable, Logger } from '@nestjs/common';
import type { ConfigContainer } from '@unifig/core';
import { InjectConfig } from '@unifig/nest';
import { AppConfig } from '../config/app.config';
import { ElevatorCreationService } from '../elevator-registry/elevator-creation/elevator-creation.service';
import { ElevatorRegistryService } from '../elevator-registry/elevator-registry.service';

@Injectable()
export class BuildingService {
  private readonly logger = new Logger(BuildingService.name);

  public constructor(
    @InjectConfig(AppConfig)
    private readonly config: ConfigContainer<AppConfig>,
    private readonly elevatorRegistry: ElevatorRegistryService,
  ) {}

  public initializeElevators(): void {
    if (this.elevatorRegistry.size() > 0) {
      this.logger.warn('Elevators already initialized');
      return;
    }

    this.logger.debug(
      `Initializing ${this.config.values.elevatorCount} elevators`,
    );

    for (let i = 0; i < this.config.values.elevatorCount; i++) {
      const elevator = ElevatorCreationService.createElevator();
      this.elevatorRegistry.register(elevator);
    }

    this.logger.debug(`Initialized ${this.elevatorRegistry.size()} elevators`);
  }

  public isValidFloor(floor: number): boolean {
    const minFloor = this.config.values.undergroundFloors * -1;
    const maxFloor = this.config.values.aboveGroundFloors;

    return floor >= minFloor && floor <= maxFloor;
  }
}
