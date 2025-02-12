import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { GroupAdminWorkspaceController } from './group-admin-workspace.controller';
import { AuthService } from '../services/auth.service';
import { WorkspaceService } from '../services/workspace.service';
import { UsersService } from '../services/users.service';

describe('GroupAdminWorkspaceController', () => {
  let controller: GroupAdminWorkspaceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GroupAdminWorkspaceController],
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
          provide: UsersService,
          useValue: createMock<UsersService>()
        }
      ]
    }).compile();

    controller = module.get<GroupAdminWorkspaceController>(GroupAdminWorkspaceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
