import { From } from '@unifig/core';
import { IsInt, Max, Min } from 'class-validator';

export class BuildingConfig {
  @From({ key: 'ELEVATOR_COUNT', default: 2 })
  @IsInt()
  @Min(1)
  @Max(50)
  elevatorCount: number;

  @From({ key: 'UNDERGROUND_FLOORS', default: 0 })
  @IsInt()
  @Min(0)
  undergroundFloors: number;

  @From({ key: 'ABOVE_GROUND_FLOORS', default: 5 })
  @IsInt()
  @Min(1)
  aboveGroundFloors: number;

  @From({ key: 'FLOOR_TRAVEL_TIME_MS', default: 2000 })
  @IsInt()
  @Min(100)
  @Max(10000)
  floorTravelTimeMs: number;

  @From({ key: 'DOOR_OPEN_CLOSE_TIME_MS', default: 300 })
  @IsInt()
  @Min(100)
  @Max(10000)
  doorOpenCloseTimeMs: number;

  @From({ key: 'DOOR_HOLD_TIME_MS', default: 1000 })
  @IsInt()
  @Min(100)
  @Max(10000)
  doorHoldTimeMs: number;
}
