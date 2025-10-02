import { Module } from '@nestjs/common';
import { ElevatorService } from './elevator.service';
import { ElevatorCreationService } from '../elevator-registry/elevator-creation/elevator-creation.service';
import { ElevatorEventEmitterService } from './elevator-event-emitter.service';
import { ElevatorCarController } from './elevator-car/elevator-car.controller';
import { ElevatorCarService } from './elevator-car/elevator-car.service';
import { BuildingModule } from '../building/building.module';
import { ElevatorRegistryModule } from '../elevator-registry/elevator-registry.module';

@Module({
  imports: [BuildingModule, ElevatorRegistryModule],
  providers: [ElevatorService, ElevatorEventEmitterService, ElevatorCarService],
  exports: [ElevatorService, ElevatorEventEmitterService],
  controllers: [ElevatorCarController],
})
export class ElevatorModule {}
