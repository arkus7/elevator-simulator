import { Test, TestingModule } from '@nestjs/testing';
import { BuildingService } from './building.service';
import { AppConfig } from '../config/app.config';
import { ConfigModule, getConfigContainerToken } from '@unifig/nest';
import { Config } from '@unifig/core';
import { EnvConfigAdapter } from '@unifig/adapter-env';
import { ElevatorRegistryModule } from '../elevator-registry/elevator-registry.module';
import { ElevatorRegistryService } from '../elevator-registry/elevator-registry.service';

describe('BuildingService', () => {
  let service: BuildingService;
  let elevatorRegistry: ElevatorRegistryService;

  beforeEach(async () => {
    await Config.register({
      templates: [AppConfig],
      adapter: new EnvConfigAdapter(),
    });
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forFeature(AppConfig), ElevatorRegistryModule],
      providers: [BuildingService, {
        provide: getConfigContainerToken(AppConfig),
        useValue: {
          values: {
            elevatorCount: 2,
          },
        }
      }],
    }).compile();

    service = module.get<BuildingService>(BuildingService);
    elevatorRegistry = module.get<ElevatorRegistryService>(
      ElevatorRegistryService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('#initializeElevators', () => {
    it('should register the elevators in the registry', () => {
      service.initializeElevators();
      expect(elevatorRegistry.size()).toBe(2);
    });
  });
});
