import { Test, TestingModule } from '@nestjs/testing';
import { StatusSimulationService } from './status-simulation.service';
import { getConfigContainerToken } from '@unifig/nest';
import { AppConfig } from '../../config/app.config';
import { ElevatorRegistryModule } from '../../elevator-registry/elevator-registry.module';
import { ElevatorModule } from '../../elevator/elevator.module';
import { Config } from '@unifig/core';
import { EnvConfigAdapter } from '@unifig/adapter-env';
import { EventEmitterModule } from '@nestjs/event-emitter';

describe('StatusSimulationService', () => {
  let service: StatusSimulationService;

  beforeEach(async () => {
    await Config.register({
      templates: [AppConfig],
      adapter: new EnvConfigAdapter(),
    });
    const module: TestingModule = await Test.createTestingModule({
      imports: [ElevatorRegistryModule, ElevatorModule, EventEmitterModule.forRoot()],
      providers: [StatusSimulationService,
        {
          provide: getConfigContainerToken(AppConfig),
          useValue: {
            values: {
              maintenanceFixTimeMs: 5000,
            },
          },
        },
      ],
    }).compile();

    service = module.get<StatusSimulationService>(StatusSimulationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
