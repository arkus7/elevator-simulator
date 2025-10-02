import { Injectable, Logger } from '@nestjs/common';
import {
  CallElevatorRequestDto,
  CallElevatorResponseDto,
} from './dto/call-elevator-request.dto';
import { ElevatorSchedulerService } from '../scheduler/elevator-scheduler/elevator-scheduler.service';
import { ElevatorRegistryService } from '../elevator-registry/elevator-registry.service';
import { BuildingService } from '../building/building.service';

@Injectable()
export class HallService {
  private readonly logger = new Logger(HallService.name);

  constructor(
    private readonly elevatorRegistryService: ElevatorRegistryService,
    private readonly elevatorSchedulerService: ElevatorSchedulerService,
    private readonly buildingService: BuildingService,
  ) {}

  public callElevator(dto: CallElevatorRequestDto): CallElevatorResponseDto {
    this.logger.log(
      `Calling elevator to floor ${dto.floor} in direction ${dto.direction}`,
    );
    if (!this.buildingService.isValidFloor(dto.floor)) {
      // TODO: Throw custom error

      this.logger.error(`Invalid floor: ${dto.floor}`);
      throw new Error('Invalid floor');
    }
    const elevator = this.elevatorSchedulerService.assignElevatorToHallRequest(
      { direction: dto.direction, floor: dto.floor },
      this.elevatorRegistryService.getAll(),
    );
    return { elevatorId: elevator };
  }
}
