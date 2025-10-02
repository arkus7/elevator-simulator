import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
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
      this.logger.error(`Invalid floor: ${dto.floor}`);
      throw new BadRequestException('Invalid floor');
    }
    try {
      const elevator =
        this.elevatorSchedulerService.assignElevatorToHallRequest(
          { direction: dto.direction, floor: dto.floor },
          this.elevatorRegistryService.getAll(),
        );
      return { elevatorId: elevator };
    } catch (err) {
      this.logger.error(`Error assigning elevator to hall request: ${err}`);
      throw new InternalServerErrorException(
        'Error assigning elevator to hall request',
      );
    }
  }
}
