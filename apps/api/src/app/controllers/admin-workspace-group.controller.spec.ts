import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { AdminWorkspaceGroupController } from './admin-workspace-group.controller';
import { AuthService } from '../services/auth.service';
import { WorkspaceService } from '../services/workspace.service';
import { WorkspaceGroupService } from '../services/workspace-group.service';
import { UsersService } from '../services/users.service';
import { UnitService } from '../services/unit.service';

describe('AdminWorkspaceGroupController', () => {
  let controller: AdminWorkspaceGroupController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminWorkspaceGroupController],
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
          provide: WorkspaceGroupService,
          useValue: createMock<WorkspaceGroupService>()
        },
        {
          provide: UsersService,
          useValue: createMock<UsersService>()
        },
        {
          provide: UnitService,
          useValue: createMock<UnitService>()
        }
      ]
    }).compile();

    controller = module.get<AdminWorkspaceGroupController>(AdminWorkspaceGroupController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
