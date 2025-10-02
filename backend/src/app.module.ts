import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@unifig/nest';
import { ElevatorModule } from './elevator/elevator.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { BuildingModule } from './building/building.module';
import { ElevatorRegistryModule } from './elevator-registry/elevator-registry.module';
import { HallModule } from './hall/hall.module';
import { SchedulerModule } from './scheduler/scheduler.module';
import { SimulationModule } from './simulation/simulation.module';
import { WebsocketModule } from './websocket/websocket.module';

@Module({
  imports: [
    ConfigModule.forRoot({}),
    EventEmitterModule.forRoot(),
    ElevatorModule,
    BuildingModule,
    ElevatorRegistryModule,
    HallModule,
    SchedulerModule,
    SimulationModule,
    WebsocketModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
