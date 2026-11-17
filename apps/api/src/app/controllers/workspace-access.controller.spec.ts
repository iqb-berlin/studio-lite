import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { WorkspaceAccessController } from './workspace-access.controller';
import { UsersService } from '../services/users.service';
import { WorkspaceService } from '../services/workspace.service';
import { IsWorkspaceGroupAdminGuard } from '../guards/is-workspace-group-admin.guard';
import { AuthService } from '../services/auth.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { ANY_WORKSPACE_GROUP_ADMIN_KEY } from '../decorators/any-workspace-group-admin.decorator';

describe('WorkspaceAccessController', () => {
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkspaceAccessController],
      providers: [
        { provide: UsersService, useValue: createMock<UsersService>() },
        { provide: WorkspaceService, useValue: createMock<WorkspaceService>() },
        { provide: IsWorkspaceGroupAdminGuard, useValue: { canActivate: jest.fn(() => true) } },
        { provide: AuthService, useValue: createMock<AuthService>() }
      ]
    }).compile();
    module.get<WorkspaceAccessController>(WorkspaceAccessController);
  });

  // The guards are the authorisation of each method; no other unit test sees them (#1953). The guard
  // finds the group through the workspace in the path.
  it.each(['findAll', 'patch'] as const)('should let only admins of the workspace\'s group reach %s', method => {
    expect(Reflect.getMetadata('__guards__', WorkspaceAccessController.prototype[method]))
      .toEqual([JwtAuthGuard, IsWorkspaceGroupAdminGuard]);
    expect(Reflect.getMetadata(ANY_WORKSPACE_GROUP_ADMIN_KEY, WorkspaceAccessController.prototype[method]))
      .toBeUndefined();
  });
});
