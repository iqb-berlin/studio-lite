import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { WorkspaceController } from './workspace.controller';
import { AuthService } from '../services/auth.service';
import { WorkspaceService } from '../services/workspace.service';
import { UnitService } from '../services/unit.service';
import { VeronaModulesService } from '../services/verona-modules.service';
import { SettingService } from '../services/setting.service';
import { UsersService } from '../services/users.service';
import { WorkspaceUserService } from '../services/workspace-user.service';
import { UnitCommentService } from '../services/unit-comment.service';

describe('WorkspaceController', () => {
  let controller: WorkspaceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkspaceController],
      providers: [
        {
          provide: AuthService,
          useValue: createMock<AuthService>()
        },
        {
          provide: WorkspaceService,
          useValue: createMock<WorkspaceService>()
        },
        {
          provide: UnitService,
          useValue: createMock<UnitService>()
        },
        {
          provide: VeronaModulesService,
          useValue: createMock<VeronaModulesService>()
        },
        {
          provide: SettingService,
          useValue: createMock<SettingService>()
        },
        {
          provide: UsersService,
          useValue: createMock<UsersService>()
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

    controller = module.get<WorkspaceController>(WorkspaceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
