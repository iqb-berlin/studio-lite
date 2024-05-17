import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { UnitsController } from './units.controller';
import { AuthService } from '../auth/service/auth.service';
import { UnitService } from '../database/services/unit.service';
import { UnitUserService } from '../database/services/unit-user.service';
import { UnitCommentService } from '../database/services/unit-comment.service';
import { WorkspaceUserService } from '../database/services/workspace-user.service';

describe('UnitsController', () => {
  let controller: UnitsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UnitsController],
      providers: [
        {
          provide: 'APP_VERSION',
          useValue: '0.0.0'
        },
        {
          provide: AuthService,
          useValue: createMock<AuthService>()
        },
        {
          provide: UnitService,
          useValue: createMock<UnitService>()
        },
        {
          provide: UnitUserService,
          useValue: createMock<UnitUserService>()
        },
        {
          provide: WorkspaceUserService,
          useValue: createMock<WorkspaceUserService>()
        },
        {
          provide: UnitCommentService,
          useValue: createMock<UnitCommentService>()
        }
      ]
    }).compile();

    controller = module.get<UnitsController>(UnitsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
