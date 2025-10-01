import { Module, OnModuleInit } from '@nestjs/common';
import { BuildingService } from './building.service';
import { ElevatorModule } from 'src/elevator/elevator.module';
import { ConfigModule } from '@unifig/nest';
import { BuildingConfig } from 'src/config/building.config';

@Module({
  imports: [ConfigModule.forFeature(BuildingConfig), ElevatorModule],
  providers: [BuildingService],
  exports: [BuildingService],
})
export class BuildingModule implements OnModuleInit {
  public constructor(private readonly buildingService: BuildingService) {}

  public onModuleInit(): void {
    this.buildingService.initializeElevators();
  }
}
