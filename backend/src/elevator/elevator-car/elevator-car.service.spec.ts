import { Test, TestingModule } from '@nestjs/testing';
import { ElevatorCarService } from './elevator-car.service';
import { Config } from '@unifig/core';
import { ElevatorRegistryModule } from '../../elevator-registry/elevator-registry.module';
import { BuildingModule } from '../../building/building.module';
import { AppConfig } from '../../config/app.config';
import { EnvConfigAdapter } from '@unifig/adapter-env';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ElevatorService } from '../elevator.service';
import { ElevatorEventEmitterService } from '../elevator-event-emitter.service';

describe('ElevatorCarService', () => {
  let service: ElevatorCarService;

  beforeEach(async () => {
    await Config.register({
      templates: [AppConfig],
      adapter: new EnvConfigAdapter(),
    });
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ElevatorRegistryModule,
        BuildingModule,
        EventEmitterModule.forRoot(),
      ],
      providers: [
        ElevatorCarService,
        ElevatorService,
        ElevatorEventEmitterService,
      ],
    }).compile();

    service = module.get<ElevatorCarService>(ElevatorCarService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
