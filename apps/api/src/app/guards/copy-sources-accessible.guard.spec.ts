import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { CopySourcesAccessibleGuard } from './copy-sources-accessible.guard';
import { UnitService } from '../services/unit.service';
import { AuthService } from '../services/auth.service';
import { UnitNotFoundException } from '../exceptions/unit-not-found.exception';

describe('CopySourcesAccessibleGuard', () => {
  let guard: CopySourcesAccessibleGuard;
  let unitService: DeepMocked<UnitService>;
  let authService: DeepMocked<AuthService>;

  const contextFor = (body: unknown): ExecutionContext => createMock<ExecutionContext>({
    switchToHttp: () => ({
      getRequest: () => ({
        user: { id: 1 }, params: { workspace_id: '3' }, method: 'POST', body
      })
    })
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: UnitService, useValue: createMock<UnitService>() },
        { provide: AuthService, useValue: createMock<AuthService>() },
        CopySourcesAccessibleGuard
      ]
    }).compile();

    guard = module.get<CopySourcesAccessibleGuard>(CopySourcesAccessibleGuard);
    unitService = module.get(UnitService);
    authService = module.get(AuthService);
    unitService.workspacesOfUnits.mockResolvedValue(new Map([[10, 5], [11, 6]]));
    authService.canAccessWorkSpace.mockResolvedValue(true);
  });

  it('should pass a unit created empty without looking anything up', async () => {
    expect(await guard.canActivate(contextFor({ key: 'U1' }))).toBe(true);
    expect(authService.canAccessWorkSpace).not.toHaveBeenCalled();
  });

  it('should pass a copy whose units lie in workspaces the user can enter', async () => {
    expect(await guard.canActivate(contextFor({ ids: [10, 11], addComments: false }))).toBe(true);
    expect(unitService.workspacesOfUnits).toHaveBeenCalledWith([10, 11]);
    expect(authService.canAccessWorkSpace).toHaveBeenCalledWith(1, 5);
    expect(authService.canAccessWorkSpace).toHaveBeenCalledWith(1, 6);
  });

  it('should ask about each source workspace once', async () => {
    unitService.workspacesOfUnits.mockResolvedValue(new Map([[10, 5], [11, 5]]));

    await guard.canActivate(contextFor({ ids: [10, 11], addComments: false }));

    expect(authService.canAccessWorkSpace).toHaveBeenCalledTimes(1);
  });

  // #1779: copying is reading -- a unit of a workspace the user cannot enter is not theirs to see
  it('should throw UnitNotFoundException for a copy of a unit in a workspace the user cannot enter', async () => {
    authService.canAccessWorkSpace.mockImplementation(async (_, workspaceId) => workspaceId !== 6);

    await expect(guard.canActivate(contextFor({ ids: [10, 11], addComments: true })))
      .rejects.toMatchObject({ response: { id: 11, method: 'POST' } });
  });

  it('should throw UnitNotFoundException for creating from a unit in a workspace the user cannot enter', async () => {
    authService.canAccessWorkSpace.mockResolvedValue(false);

    await expect(guard.canActivate(contextFor({ key: 'U1', createFrom: 10 })))
      .rejects.toThrow(UnitNotFoundException);
    expect(unitService.workspacesOfUnits).toHaveBeenCalledWith([10]);
  });

  it('should throw UnitNotFoundException for a unit that does not exist', async () => {
    await expect(guard.canActivate(contextFor({ key: 'U1', createFrom: 12 })))
      .rejects.toMatchObject({ response: { id: 12 } });
  });

  it.each([
    [{ key: 'U1', createFrom: 'abc' }],
    [{ ids: [10, -1], addComments: false }],
    [{ ids: '10', addComments: false }]
  ])(
    'should throw UnitNotFoundException for the body %p without looking it up',
    async body => {
      await expect(guard.canActivate(contextFor(body))).rejects.toThrow(UnitNotFoundException);
      expect(unitService.workspacesOfUnits).not.toHaveBeenCalled();
    }
  );
});
