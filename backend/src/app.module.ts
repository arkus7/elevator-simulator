import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@unifig/nest';
import { ElevatorModule } from './elevator/elevator.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { BuildingModule } from './building/building.module';
import { ElevatorRegistryModule } from './elevator-registry/elevator-registry.module';

@Module({
  imports: [
    ConfigModule.forRoot({}),
    EventEmitterModule.forRoot(),
    ElevatorModule,
    BuildingModule,
    ElevatorRegistryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
