import { Module } from '@nestjs/common';
import { ElevatorService } from './elevator.service';
import { ElevatorCreationService } from '../elevator-registry/elevator-creation/elevator-creation.service';
import { ElevatorEventEmitterService } from './elevator-event-emitter.service';

@Module({
  providers: [
    ElevatorService,
    ElevatorCreationService,
    ElevatorEventEmitterService,
  ],
  exports: [ElevatorService, ElevatorEventEmitterService],
})
export class ElevatorModule {}
