import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { AdminUserController } from './admin-user-controller';
import { AuthService } from '../services/auth.service';
import { WorkspaceService } from '../services/workspace.service';
import { UsersService } from '../services/users.service';
import { WorkspaceGroupService } from '../services/workspace-group.service';

describe('AdminUserController', () => {
  let controller: AdminUserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminUserController],
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
        },
        {
          provide: WorkspaceGroupService,
          useValue: createMock<WorkspaceGroupService>()
        }
      ]
    }).compile();

    controller = module.get<AdminUserController>(AdminUserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
