import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { AdminWorkspaceController } from './admin-workspace.controller';
import { AuthService } from '../service/auth.service';
import { WorkspaceService } from '../database/services/workspace.service';
import { UsersService } from '../database/services/users.service';

describe('AdminWorkspaceController', () => {
  let controller: AdminWorkspaceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminWorkspaceController],
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

    controller = module.get<AdminWorkspaceController>(AdminWorkspaceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
