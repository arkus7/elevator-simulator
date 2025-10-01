import { Module } from '@nestjs/common';
import { ElevatorService } from './elevator.service';
import { ElevatorCreationService } from './elevator-creation/elevator-creation.service';

@Module({
  providers: [ElevatorService, ElevatorCreationService],
  exports: [ElevatorService],
})
export class ElevatorModule {}
