import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { WorkspaceGroupsController } from './workspace-groups.controller';
import { AuthService } from '../../auth/service/auth.service';
import { WorkspaceService } from '../../database/services/workspace.service';
import { WorkspaceGroupService } from '../../database/services/workspace-group.service';
import { UsersService } from '../../database/services/users.service';

describe('WorkspaceGroupsController', () => {
  let controller: WorkspaceGroupsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkspaceGroupsController],
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
        }
      ]
    }).compile();

    controller = module.get<WorkspaceGroupsController>(WorkspaceGroupsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
