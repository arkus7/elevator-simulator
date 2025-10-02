import { ApiProperty } from "@nestjs/swagger";
import { ElevatorDirection, ElevatorDoorState, ElevatorMotionState, ElevatorStatus } from "src/elevator/elevator.interface";

export class BuildingConfig {
  @ApiProperty({ description: 'The minimum floor of the building', example: -2 })
  minFloor: number;
  @ApiProperty({ description: 'The maximum floor of the building', example: 5 })
  maxFloor: number;
  @ApiProperty({ description: 'The number of elevators in the building', example: 3 })
  elevatorCount: number;
}

export class ElevatorState {
  @ApiProperty({ description: 'The ID of the elevator', example: 'A' })
  id: string;
  @ApiProperty({ description: 'The current floor of the elevator', example: 1 })
  currentFloor: number;
  @ApiProperty({ description: 'The direction of the elevator', enum: ElevatorDirection, example: ElevatorDirection.Up })
  direction: ElevatorDirection;
  @ApiProperty({ description: 'The state of the elevator doors', enum: ElevatorDoorState, example: ElevatorDoorState.Open })
  doorState: ElevatorDoorState;
  @ApiProperty({ description: 'The motion state of the elevator', enum: ElevatorMotionState, example: ElevatorMotionState.Moving })
  motionState: ElevatorMotionState;
  @ApiProperty({ description: 'The destination floors of the elevator', example: [1, 3, 5] })
  destinationFloors: number[];
  @ApiProperty({ description: 'The status of the elevator', enum: ElevatorStatus, example: ElevatorStatus.Active })
  status: ElevatorStatus;
}


export class BuildingStateResponseDto {
    @ApiProperty({ type: BuildingConfig })
    config: BuildingConfig;
    @ApiProperty({ type: [ElevatorState] })
    elevators: ElevatorState[];
  }
  