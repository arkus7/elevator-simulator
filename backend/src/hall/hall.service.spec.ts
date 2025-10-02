import { Test, TestingModule } from '@nestjs/testing';
import { HallService } from './hall.service';
import { SchedulerModule } from '../scheduler/scheduler.module';
import { ElevatorRegistryModule } from '../elevator-registry/elevator-registry.module';
import { BuildingModule } from '../building/building.module';
import { AppConfig } from '../config/app.config';
import { Config } from '@unifig/core';
import { EnvConfigAdapter } from '@unifig/adapter-env';
import { ElevatorModule } from '../elevator/elevator.module';
import { EventEmitterModule } from '@nestjs/event-emitter';

describe('HallService', () => {
  let service: HallService;

  beforeEach(async () => {
    await Config.register({
      templates: [AppConfig],
      adapter: new EnvConfigAdapter(),
    });
    const module: TestingModule = await Test.createTestingModule({
      imports: [EventEmitterModule.forRoot(), ElevatorRegistryModule, SchedulerModule, BuildingModule, ElevatorModule],
      providers: [HallService],
    }).compile();

    service = module.get<HallService>(HallService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
