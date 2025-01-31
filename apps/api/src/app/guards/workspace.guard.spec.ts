import { Test, TestingModule } from '@nestjs/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { WorkspaceGuard } from './workspace.guard';
import { AuthService } from '../auth/service/auth.service';

describe('WorkspaceGuard', () => {
  let workspaceGuard: WorkspaceGuard;
  let authService: DeepMocked<AuthService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: AuthService,
          useValue: createMock<AuthService>()
        }
      ]
    }).compile();
    authService = module.get(AuthService);
    workspaceGuard = new WorkspaceGuard(authService);
  });

  it('should be defined', () => {
    expect(workspaceGuard).toBeDefined();
  });
});
