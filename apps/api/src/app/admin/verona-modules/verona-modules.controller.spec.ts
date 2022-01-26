import { Test, TestingModule } from '@nestjs/testing';
import { VeronaModulesController } from './verona-modules.controller';

describe('VeronaModulesController', () => {
  let controller: VeronaModulesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VeronaModulesController],
    }).compile();

    controller = module.get<VeronaModulesController>(VeronaModulesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
