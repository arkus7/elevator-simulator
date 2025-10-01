import { Module } from '@nestjs/common';
import { ElevatorRegistryService } from './elevator-registry.service';

@Module({
  providers: [ElevatorRegistryService],
  exports: [ElevatorRegistryService],
})
export class ElevatorRegistryModule {}
