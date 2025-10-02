import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { ElevatorCarService } from './elevator-car.service';
import { ScheduleFloorRequestDto } from './dto/schedule-floor-request.dto';
import {
  ApiAcceptedResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOperation,
} from '@nestjs/swagger';

@Controller('elevator-car')
export class ElevatorCarController {
  public constructor(private readonly elevatorCarService: ElevatorCarService) {}

  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Request opening the door of an elevator' })
  @ApiAcceptedResponse({ description: 'Door will be opened' })
  @ApiBadRequestResponse({
    description: 'Invalid state for opening the door (e.g. elevator is moving)',
  })
  @ApiNotFoundResponse({ description: 'Elevator with provided ID not found' })
  @Post('/:elevatorId/open-door')
  public openDoor(@Param('elevatorId') elevatorId: string): void {
    return this.elevatorCarService.openDoor(elevatorId);
  }

  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Request closing the door of an elevator' })
  @ApiAcceptedResponse({ description: 'Door will be closed' })
  @ApiBadRequestResponse({
    description: 'Invalid state for closing the door (e.g. elevator is moving)',
  })
  @ApiNotFoundResponse({ description: 'Elevator with provided ID not found' })
  @Post('/:elevatorId/close-door')
  public closeDoor(@Param('elevatorId') elevatorId: string): void {
    return this.elevatorCarService.closeDoor(elevatorId);
  }

  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Request scheduling a floor for an elevator' })
  @ApiAcceptedResponse({ description: 'Floor will be scheduled' })
  @ApiBadRequestResponse({ description: 'Invalid floor' })
  @ApiNotFoundResponse({ description: 'Elevator with provided ID not found' })
  @Post('/:elevatorId/schedule-floor')
  public scheduleFloor(
    @Param('elevatorId') elevatorId: string,
    @Body() dto: ScheduleFloorRequestDto,
  ): void {
    return this.elevatorCarService.requestFloor(elevatorId, dto.floor);
  }

  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Request maintenance for an elevator' })
  @ApiAcceptedResponse({ description: 'Elevator will enter maintenance mode' })
  @ApiNotFoundResponse({ description: 'Elevator with provided ID not found' })
  @Post('/:elevatorId/request-maintenance')
  public startMaintenance(@Param('elevatorId') elevatorId: string): void {
    return this.elevatorCarService.startMaintenance(elevatorId);
  }
}
