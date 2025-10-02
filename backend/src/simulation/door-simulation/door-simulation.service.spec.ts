import { Test, TestingModule } from '@nestjs/testing';
import { DoorSimulationService } from './door-simulation.service';
import { SimulationModule } from '../simulation.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { Config } from '@unifig/core';
import { EnvConfigAdapter } from '@unifig/adapter-env';
import { AppConfig } from '../../config/app.config';
import { ElevatorModule } from '../../elevator/elevator.module';

describe('DoorSimulationService', () => {
  let service: DoorSimulationService;

  beforeEach(async () => {
    await Config.register({
      templates: [AppConfig],
      adapter: new EnvConfigAdapter(),
    });
    const module: TestingModule = await Test.createTestingModule({
      imports: [EventEmitterModule.forRoot(), SimulationModule, ElevatorModule],
    }).compile();

    service = module.get<DoorSimulationService>(DoorSimulationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
