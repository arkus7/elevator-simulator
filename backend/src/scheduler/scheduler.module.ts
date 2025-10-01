import { Module } from '@nestjs/common';
import { ElevatorSchedulerService } from './elevator-scheduler/elevator-scheduler.service';
import { ElevatorModule } from '../elevator/elevator.module';

@Module({
  imports: [ElevatorModule],
  providers: [ElevatorSchedulerService],
  exports: [ElevatorSchedulerService],
})
export class SchedulerModule {}
