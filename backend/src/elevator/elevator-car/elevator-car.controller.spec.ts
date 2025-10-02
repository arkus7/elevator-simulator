import { Test, TestingModule } from '@nestjs/testing';
import { ElevatorCarController } from './elevator-car.controller';
import { ElevatorCarService } from './elevator-car.service';
import { ElevatorService } from '../elevator.service';
import { ElevatorRegistryModule } from '../../elevator-registry/elevator-registry.module';
import { BuildingModule } from '../../building/building.module';
import { Config } from '@unifig/core';
import { EnvConfigAdapter } from '@unifig/adapter-env';
import { AppConfig } from '../../config/app.config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ElevatorEventEmitterService } from '../elevator-event-emitter.service';

describe('ElevatorCarController', () => {
  let controller: ElevatorCarController;

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
      controllers: [ElevatorCarController],
      providers: [
        ElevatorCarService,
        ElevatorService,
        ElevatorEventEmitterService,
      ],
    }).compile();

    controller = module.get<ElevatorCarController>(ElevatorCarController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
