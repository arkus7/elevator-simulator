import { Test, TestingModule } from '@nestjs/testing';
import { BuildingService } from './building.service';
import { Elevator, ElevatorId } from 'src/elevator/elevator.interface';
import { BuildingConfig } from '../config/building.config';
import { ConfigModule } from '@unifig/nest';
import { Config } from '@unifig/core';
import { EnvConfigAdapter } from '@unifig/adapter-env';

describe('BuildingService', () => {
  let service: BuildingService;

  beforeEach(async () => {
    await Config.register({
      templates: [BuildingConfig],
      adapter: new EnvConfigAdapter(),
    });
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forFeature(BuildingConfig)],
      providers: [BuildingService],
    }).compile();

    service = module.get<BuildingService>(BuildingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('#initializeElevators', () => {
    it('should initialize the elevators', () => {
      service.initializeElevators();
      expect((service as  unknown as { elevators: Map<ElevatorId, Elevator> }).elevators.size).toBe(2);
    });
  });
});
