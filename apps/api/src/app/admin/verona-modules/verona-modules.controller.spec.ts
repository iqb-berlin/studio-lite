import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { VeronaModulesController } from './verona-modules.controller';
import { AuthService } from '../../auth/service/auth.service';
import { VeronaModulesService } from '../../database/services/verona-modules.service';

describe('VeronaModulesController', () => {
  let controller: VeronaModulesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VeronaModulesController],
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

    controller = module.get<VeronaModulesController>(VeronaModulesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
