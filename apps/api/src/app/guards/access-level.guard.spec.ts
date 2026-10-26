import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { createMock } from '@golevelup/ts-jest';
import { AccessLevelCheck, AccessLevelGuard } from './access-level.guard';

const hasLevel = jest.fn<ReturnType<AccessLevelCheck>, Parameters<AccessLevelCheck>>();

/** Asks the mock as its rung, so the tests decide whether the user holds it. */
class TestAccessLevelGuard extends AccessLevelGuard {
  constructor() {
    super(hasLevel);
  }
}

describe('AccessLevelGuard', () => {
  let guard: TestAccessLevelGuard;

  const contextFor = (userId: number, workspaceId: number) => createMock<ExecutionContext>({
    switchToHttp: () => ({
      getRequest: () => ({
        user: { id: userId },
        params: { workspace_id: workspaceId }
      })
    })
  });

  beforeEach(() => {
    hasLevel.mockReset();
    guard = new TestAccessLevelGuard();
  });

  it('passes when the user holds the level, asked with the user and the workspace of the route', async () => {
    hasLevel.mockResolvedValue(true);

    expect(await guard.canActivate(contextFor(1, 7))).toBe(true);
    expect(hasLevel).toHaveBeenCalledWith(1, 7);
  });

  it('throws ForbiddenException when the user does not hold the level', async () => {
    hasLevel.mockResolvedValue(false);

    await expect(guard.canActivate(contextFor(1, 7))).rejects.toThrow(ForbiddenException);
    expect(hasLevel).toHaveBeenCalledWith(1, 7);
  });
});
