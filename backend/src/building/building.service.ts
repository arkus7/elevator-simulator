import { Injectable, Logger } from '@nestjs/common';
import type { ConfigContainer } from '@unifig/core';
import { InjectConfig } from '@unifig/nest';
import { AppConfig } from '../config/app.config';
import { ElevatorCreationService } from '../elevator-registry/elevator-creation/elevator-creation.service';
import { ElevatorRegistryService } from '../elevator-registry/elevator-registry.service';
import { BuildingStateResponseDto } from './dto/building-state-response.dto';

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
      const elevator = ElevatorCreationService.createElevator({errorRate: this.config.values.errorRate});
      this.elevatorRegistry.register(elevator);
    }

    this.logger.debug(`Initialized ${this.elevatorRegistry.size()} elevators`);
  }

  public getBuildingState(): BuildingStateResponseDto {
    const elevators = this.elevatorRegistry.getAll();
    const minFloor = this.config.values.undergroundFloors * -1;
    const maxFloor = this.config.values.aboveGroundFloors;

    return {
      config: {
        minFloor,
        maxFloor,
        elevatorCount: this.config.values.elevatorCount,
      },
      elevators: elevators.map((elevator) => ({
        id: elevator.id,
        currentFloor: elevator.currentFloor,
        direction: elevator.direction,
        doorState: elevator.doorState,
        motionState: elevator.motionState,
        destinationFloors: elevator.destinationFloors,
        status: elevator.status,
      })),
    };
  }

  public isValidFloor(floor: number): boolean {
    const minFloor = this.config.values.undergroundFloors * -1;
    const maxFloor = this.config.values.aboveGroundFloors;

    return floor >= minFloor && floor <= maxFloor;
  }
}
