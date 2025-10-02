import { Module, OnModuleInit } from '@nestjs/common';
import { BuildingService } from './building.service';
import { BuildingController } from './building.controller';
import { ConfigModule } from '@unifig/nest';
import { AppConfig } from '../config/app.config';
import { ElevatorRegistryModule } from '../elevator-registry/elevator-registry.module';

@Module({
  imports: [ConfigModule.forFeature(AppConfig), ElevatorRegistryModule],
  controllers: [BuildingController],
  providers: [BuildingService],
  exports: [BuildingService],
})
export class BuildingModule implements OnModuleInit {
  public constructor(private readonly buildingService: BuildingService) {}

  public onModuleInit(): void {
    this.buildingService.initializeElevators();
  }
}
