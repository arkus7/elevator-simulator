import { Injectable, Logger } from '@nestjs/common';
import {
  Elevator,
  ElevatorDirection,
  ElevatorStatus,
} from '../../elevator/elevator.interface';
import { ElevatorService } from '../../elevator/elevator.service';

export interface HallRequest {
  floor: number;
  direction: ElevatorDirection.Up | ElevatorDirection.Down;
}

@Injectable()
export class ElevatorSchedulerService {
  private readonly logger = new Logger(ElevatorSchedulerService.name);
  public constructor(private readonly elevatorService: ElevatorService) {}

  public assignElevatorToHallRequest(
    request: HallRequest,
    elevators: Elevator[],
  ): string {
    this.logger.log(
      `Assigning elevator to hall request on floor ${request.floor} in direction ${request.direction}`,
    );
    const activeElevators = elevators.filter(
      (e) => e.status === ElevatorStatus.Active,
    );

    if (activeElevators.length === 0) {
      // TODO: Throw custom error
      throw new Error('No active elevators available');
    }

    let bestElevator: Elevator | null = null;
    let bestScore = Infinity;

    for (const elevator of activeElevators) {
      const score = this.calculateScore(elevator, request);
      this.logger.log(`Score for elevator ${elevator.id}: ${score}`);
      if (score < bestScore) {
        bestScore = score;
        bestElevator = elevator;
      }
    }

    if (!bestElevator) {
      // TODO: Throw custom error
      throw new Error('No best elevator found');
    }

    this.logger.log(
      `Selected elevator ${bestElevator.id} for hall request on floor ${request.floor} in direction ${request.direction}`,
    );
    this.logger.log(`Score: ${bestScore}`);

    this.logger.log(
      `Scheduling car request on floor ${request.floor} for elevator ${bestElevator.id}`,
    );
    this.elevatorService.scheduleCarRequest(bestElevator, request.floor);
    this.logger.log(
      `Car request scheduled on floor ${request.floor} for elevator ${bestElevator.id}`,
    );

    return bestElevator.id;
  }

  private calculateScore(elevator: Elevator, request: HallRequest): number {
    const { currentFloor, direction } = elevator;
    const { floor: requestFloor } = request;

    this.logger.debug(
      `Current floor: ${currentFloor}, direction: ${direction}, request floor: ${requestFloor}`,
    );

    // Idle elevator - distance is direct
    if (
      direction === ElevatorDirection.Idle ||
      this.isElevatorMovingInSameDirection(elevator, request)
    ) {
      this.logger.debug('Idle or moving in same direction');
      return Math.abs(requestFloor - currentFloor);
    }

    // Elevator moving in same direction but request is behind
    if (this.isRequestBehindElevator(elevator, request)) {
      this.logger.debug('Request is behind elevator');
      // needs to complete current direction first, then reverse
      const furthestDestination = this.getFurthestDestination(elevator);
      const distanceToFurthest = Math.abs(furthestDestination - currentFloor);
      const distanceFromFurthestToRequest = Math.abs(
        requestFloor - furthestDestination,
      );
      return distanceToFurthest + distanceFromFurthestToRequest;
    }

    this.logger.debug('Elevator moving opposite direction');
    // Elevator moving opposite direction - need to complete, reverse, then serve
    const furthestDestination = this.getFurthestDestination(elevator);
    const distanceToFurthest = Math.abs(furthestDestination - currentFloor);
    const distanceFromFurthestToRequest = Math.abs(
      requestFloor - furthestDestination,
    );
    return distanceToFurthest + distanceFromFurthestToRequest + 100; // Penalty for opposite direction
  }

  private isRequestBehindElevator(
    elevator: Elevator,
    request: HallRequest,
  ): boolean {
    const { currentFloor, direction } = elevator;
    const { floor: requestFloor } = request;

    return (
      (direction === ElevatorDirection.Up && requestFloor < currentFloor) ||
      (direction === ElevatorDirection.Down && requestFloor > currentFloor)
    );
  }

  private isElevatorMovingInSameDirection(
    elevator: Elevator,
    request: HallRequest,
  ): boolean {
    const { currentFloor, direction } = elevator;
    const { floor: requestFloor, direction: requestDirection } = request;

    return (
      (direction === ElevatorDirection.Up &&
        requestDirection === ElevatorDirection.Up &&
        requestFloor >= currentFloor) ||
      (direction === ElevatorDirection.Down &&
        requestDirection === ElevatorDirection.Down &&
        requestFloor <= currentFloor)
    );
  }

  private getFurthestDestination(elevator: Elevator): number {
    // Idle elevator - return current floor
    if (elevator.direction === ElevatorDirection.Idle) {
      return elevator.currentFloor;
    }

    if (elevator.direction === ElevatorDirection.Up) {
      return Math.max(...elevator.destinationFloors);
    } else {
      return Math.min(...elevator.destinationFloors);
    }
  }
}
