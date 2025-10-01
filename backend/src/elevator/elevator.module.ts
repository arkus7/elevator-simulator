import { Module } from '@nestjs/common';
import { ElevatorService } from './elevator.service';

@Module({
  providers: [ElevatorService],
  exports: [ElevatorService],
})
export class ElevatorModule {}
