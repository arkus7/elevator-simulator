import { Test, TestingModule } from '@nestjs/testing';
import { ElevatorRegistryService } from './elevator-registry.service';

describe('ElevatorRegistryService', () => {
  let service: ElevatorRegistryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ElevatorRegistryService],
    }).compile();

    service = module.get<ElevatorRegistryService>(ElevatorRegistryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
