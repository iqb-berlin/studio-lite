import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { VeronaModuleController } from './verona-module.controller';
import { AuthService } from '../auth/service/auth.service';
import { VeronaModulesService } from '../database/services/verona-modules.service';

describe('VeronaModuleController', () => {
  let controller: VeronaModuleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VeronaModuleController],
      providers: [
        {
          provide: AuthService,
          useValue: createMock<AuthService>()
        },
        {
          provide: VeronaModulesService,
          useValue: createMock<VeronaModulesService>()
        }
      ]
    }).compile();

    controller = module.get<VeronaModuleController>(VeronaModuleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
