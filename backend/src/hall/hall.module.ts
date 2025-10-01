import { Module } from '@nestjs/common';
import { HallService } from './hall.service';
import { HallController } from './hall.controller';
import { ElevatorRegistryModule } from '../elevator-registry/elevator-registry.module';
import { SchedulerModule } from '../scheduler/scheduler.module';

@Module({
  imports: [ElevatorRegistryModule, SchedulerModule],
  providers: [HallService],
  controllers: [HallController],
})
export class HallModule {}
