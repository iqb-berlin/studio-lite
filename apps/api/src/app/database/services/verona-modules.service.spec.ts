import { Test, TestingModule } from '@nestjs/testing';
import { VeronaModulesService } from './verona-modules.service';

describe('VeronaModulesService', () => {
  let service: VeronaModulesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VeronaModulesService]
    }).compile();

    service = module.get<VeronaModulesService>(VeronaModulesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
