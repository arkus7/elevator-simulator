import { Test, TestingModule } from '@nestjs/testing';
import { HallService } from './hall.service';
import { SchedulerModule } from '../scheduler/scheduler.module';
import { ElevatorRegistryModule } from '../elevator-registry/elevator-registry.module';

describe('HallService', () => {
  let service: HallService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ElevatorRegistryModule, SchedulerModule],
      providers: [HallService],
    }).compile();

    service = module.get<HallService>(HallService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
