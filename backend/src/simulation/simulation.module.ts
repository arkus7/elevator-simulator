import { Module } from '@nestjs/common';
import { MotionSimulationService } from './motion-simulation/motion-simulation.service';
import { DoorSimulationService } from './door-simulation/door-simulation.service';
import { AppConfig } from '../config/app.config';
import { ConfigModule } from '@unifig/nest';
import { ElevatorRegistryModule } from '../elevator-registry/elevator-registry.module';
import { BuildingModule } from '../building/building.module';
import { ElevatorModule } from '../elevator/elevator.module';

@Module({
  imports: [
    ConfigModule.forFeature(AppConfig),
    ElevatorRegistryModule,
    BuildingModule,
    ElevatorModule,
  ],
  providers: [MotionSimulationService, DoorSimulationService],
})
export class SimulationModule {}
