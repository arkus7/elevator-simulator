import { IsIn, IsInt } from 'class-validator';
import { ElevatorDirection } from '../../elevator/elevator.interface';
import { ApiProperty } from '@nestjs/swagger';

export class CallElevatorRequestDto {
  @IsInt()
  @ApiProperty({
    description: 'The floor to call the elevator to',
    example: 1,
  })
  floor: number;

  @IsIn([ElevatorDirection.Up, ElevatorDirection.Down])
  @ApiProperty({
    description: 'The direction to call the elevator to',
    example: 'up',
  })
  direction: ElevatorDirection.Up | ElevatorDirection.Down;
}

export class CallElevatorResponseDto {
  @ApiProperty({
    description: 'The ID of the elevator that will service the request',
    example: 'A',
  })
  elevatorId: string;
}
