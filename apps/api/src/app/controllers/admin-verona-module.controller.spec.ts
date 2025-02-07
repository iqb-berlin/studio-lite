import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { AdminVeronaModuleController } from './admin-verona-module.controller';
import { AuthService } from '../services/auth.service';
import { VeronaModulesService } from '../services/verona-modules.service';

describe('AdminVeronaModuleController', () => {
  let controller: AdminVeronaModuleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminVeronaModuleController],
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

    controller = module.get<AdminVeronaModuleController>(AdminVeronaModuleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
