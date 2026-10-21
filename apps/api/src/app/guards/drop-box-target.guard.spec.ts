import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { DropBoxTargetGuard } from './drop-box-target.guard';
import { WorkspaceService } from '../services/workspace.service';

describe('DropBoxTargetGuard', () => {
  let guard: DropBoxTargetGuard;
  let workspaceService: DeepMocked<WorkspaceService>;

  const contextFor = (body: unknown): ExecutionContext => createMock<ExecutionContext>({
    switchToHttp: () => ({
      getRequest: () => ({ user: { id: 1 }, params: { workspace_id: '3' }, body })
    })
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: WorkspaceService, useValue: createMock<WorkspaceService>() },
        DropBoxTargetGuard
      ]
    }).compile();

    guard = module.get<DropBoxTargetGuard>(DropBoxTargetGuard);
    workspaceService = module.get(WorkspaceService);
    workspaceService.dropBoxIdOf.mockResolvedValue(7);
  });

  it('should pass a submission to the drop box of the workspace', async () => {
    expect(await guard.canActivate(contextFor({ ids: [10], targetId: 7 }))).toBe(true);
    expect(workspaceService.dropBoxIdOf).toHaveBeenCalledWith(3);
  });

  it('should pass a return without looking the workspace up', async () => {
    expect(await guard.canActivate(contextFor({ ids: [10] }))).toBe(true);
    expect(workspaceService.dropBoxIdOf).not.toHaveBeenCalled();
  });

  // #1780: any workspace id was taken for the drop box
  it.each([8, '8', 'abc', null])(
    'should throw ForbiddenException for the target %p, which is not the drop box',
    async targetId => {
      await expect(guard.canActivate(contextFor({ ids: [10], targetId }))).rejects.toThrow(ForbiddenException);
    }
  );

  it('should throw ForbiddenException when the workspace has no drop box', async () => {
    workspaceService.dropBoxIdOf.mockResolvedValue(null);

    await expect(guard.canActivate(contextFor({ ids: [10], targetId: 7 }))).rejects.toThrow(ForbiddenException);
  });
});
