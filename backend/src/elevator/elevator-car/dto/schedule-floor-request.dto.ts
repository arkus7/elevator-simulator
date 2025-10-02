import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class ScheduleFloorRequestDto {
  @IsInt()
  @ApiProperty({
    description: 'The floor to schedule the elevator for',
    example: 1,
  })
  floor: number;
}
