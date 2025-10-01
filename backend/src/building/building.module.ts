import { Module, OnModuleInit } from '@nestjs/common';
import { BuildingService } from './building.service';
import { ConfigModule } from '@unifig/nest';
import { BuildingConfig } from '../config/building.config';
import { ElevatorRegistryModule } from '../elevator-registry/elevator-registry.module';

@Module({
  imports: [ConfigModule.forFeature(BuildingConfig), ElevatorRegistryModule],
  providers: [BuildingService],
  exports: [BuildingService],
})
export class BuildingModule implements OnModuleInit {
  public constructor(private readonly buildingService: BuildingService) {}

  public onModuleInit(): void {
    this.buildingService.initializeElevators();
  }
}
