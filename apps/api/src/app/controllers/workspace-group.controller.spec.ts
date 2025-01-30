import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { WorkspaceGroupController } from './workspace-group.controller';
import { AuthService } from '../auth/service/auth.service';
import { WorkspaceService } from '../database/services/workspace.service';
import { WorkspaceGroupService } from '../database/services/workspace-group.service';
import { UsersService } from '../database/services/users.service';
import { UnitService } from '../database/services/unit.service';

describe('WorkspaceGroupController', () => {
  let controller: WorkspaceGroupController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkspaceGroupController],
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

    controller = module.get<WorkspaceGroupController>(WorkspaceGroupController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
