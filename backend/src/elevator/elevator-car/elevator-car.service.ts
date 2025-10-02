import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ElevatorRegistryService } from '../../elevator-registry/elevator-registry.service';
import { ElevatorService } from '../elevator.service';
import { Elevator, ElevatorId } from '../elevator.interface';
import { BuildingService } from '../../building/building.service';

@Injectable()
export class ElevatorCarService {
  public constructor(
    private readonly elevatorService: ElevatorService,
    private readonly elevatorRegistryService: ElevatorRegistryService,
    private readonly buildingService: BuildingService,
  ) {}

  public openDoor(elevatorId: ElevatorId): void {
    const elevator = this.getElevator(elevatorId);
    return this.elevatorService.startOpeningDoor(elevator);
  }

  public closeDoor(elevatorId: ElevatorId): void {
    const elevator = this.getElevator(elevatorId);
    return this.elevatorService.startClosingDoor(elevator);
  }

  public requestFloor(elevatorId: ElevatorId, floor: number): void {
    const elevator = this.getElevator(elevatorId);
    if (!this.buildingService.isValidFloor(floor)) {
      throw new BadRequestException('Invalid floor');
    }
    return this.elevatorService.scheduleCarRequest(elevator, floor);
  }

  public startMaintenance(elevatorId: ElevatorId): void {
    const elevator = this.getElevator(elevatorId);
    return this.elevatorService.startMaintenance(elevator);
  }

  private getElevator(elevatorId: ElevatorId): Elevator {
    const elevator = this.elevatorRegistryService.get(elevatorId);
    if (!elevator) {
      throw new NotFoundException(`Elevator ${elevatorId} not found`);
    }
    return elevator;
  }
}
