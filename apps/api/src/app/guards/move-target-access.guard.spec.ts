import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { MoveTargetAccessGuard } from './move-target-access.guard';
import { WorkspaceUserService } from '../services/workspace-user.service';

describe('MoveTargetAccessGuard', () => {
  let guard: MoveTargetAccessGuard;
  let workspaceUserService: DeepMocked<WorkspaceUserService>;

  const contextFor = (body: unknown): ExecutionContext => createMock<ExecutionContext>({
    switchToHttp: () => ({
      getRequest: () => ({ user: { id: 1 }, params: { workspace_id: '3' }, body })
    })
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: WorkspaceUserService, useValue: createMock<WorkspaceUserService>() },
        MoveTargetAccessGuard
      ]
    }).compile();

    guard = module.get<MoveTargetAccessGuard>(MoveTargetAccessGuard);
    workspaceUserService = module.get(WorkspaceUserService);
  });

  it('should pass when the user can manage units in the target', async () => {
    workspaceUserService.canManage.mockResolvedValue(true);

    expect(await guard.canActivate(contextFor({ ids: [10], targetId: 7 }))).toBe(true);
    expect(workspaceUserService.canManage).toHaveBeenCalledWith(1, 7);
  });

  it('should read a target written as text', async () => {
    workspaceUserService.canManage.mockResolvedValue(true);

    expect(await guard.canActivate(contextFor({ ids: [10], targetId: '7' }))).toBe(true);
    expect(workspaceUserService.canManage).toHaveBeenCalledWith(1, 7);
  });

  // #1780: the source alone was asked, so units could be moved into any workspace
  it('should throw ForbiddenException when the user cannot manage units in the target', async () => {
    workspaceUserService.canManage.mockResolvedValue(false);

    await expect(guard.canActivate(contextFor({ ids: [10], targetId: 7 }))).rejects.toThrow(ForbiddenException);
  });

  it.each([[{ ids: [10] }], [{ ids: [10], targetId: 'abc' }], [{ ids: [10], targetId: 0 }], [undefined]])(
    'should throw ForbiddenException for the body %p without looking it up',
    async body => {
      await expect(guard.canActivate(contextFor(body))).rejects.toThrow(ForbiddenException);
      expect(workspaceUserService.canManage).not.toHaveBeenCalled();
    }
  );
});
