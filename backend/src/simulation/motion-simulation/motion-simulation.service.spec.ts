import { Test, TestingModule } from '@nestjs/testing';
import { MotionSimulationService } from './motion-simulation.service';
import { SimulationModule } from '../simulation.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { Config } from '@unifig/core';
import { EnvConfigAdapter } from '@unifig/adapter-env';
import { AppConfig } from '../../config/app.config';
import { ElevatorModule } from '../../elevator/elevator.module';

describe('MotionSimulationService', () => {
  let service: MotionSimulationService;

  beforeEach(async () => {
    await Config.register({
      templates: [AppConfig],
      adapter: new EnvConfigAdapter(),
    });
    const module: TestingModule = await Test.createTestingModule({
      imports: [EventEmitterModule.forRoot(), SimulationModule, ElevatorModule],
    }).compile();

    service = module.get<MotionSimulationService>(MotionSimulationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
