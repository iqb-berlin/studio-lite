import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { UnitInWorkspaceGuard } from './unit-in-workspace.guard';
import { UnitService } from '../services/unit.service';
import { UnitNotFoundException } from '../exceptions/unit-not-found.exception';

describe('UnitInWorkspaceGuard', () => {
  let guard: UnitInWorkspaceGuard;
  let unitService: DeepMocked<UnitService>;

  const contextFor = (params: Record<string, string>, method = 'GET'): ExecutionContext => createMock<
    ExecutionContext>({
    switchToHttp: () => ({
      getRequest: () => ({ user: { id: 1 }, params, method })
    })
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: UnitService,
          useValue: createMock<UnitService>()
        },
        UnitInWorkspaceGuard
      ]
    }).compile();

    guard = module.get<UnitInWorkspaceGuard>(UnitInWorkspaceGuard);
    unitService = module.get(UnitService);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should pass when the unit is in the workspace of the route', async () => {
    unitService.isInWorkspace.mockResolvedValue(true);

    expect(await guard.canActivate(contextFor({ workspace_id: '3', unit_id: '10' }))).toBe(true);
    expect(unitService.isInWorkspace).toHaveBeenCalledWith(10, 3);
  });

  it('should throw UnitNotFoundException when the unit is not in the workspace of the route', async () => {
    unitService.isInWorkspace.mockResolvedValue(false);

    await expect(guard.canActivate(contextFor({ workspace_id: '7', unit_id: '10' })))
      .rejects.toThrow(UnitNotFoundException);
  });

  it.each(['abc', '0', '010', ' 10', '10.0', '0xa', '-10', ''])(
    'should throw UnitNotFoundException for the unit %p without looking it up',
    async unitId => {
      await expect(guard.canActivate(contextFor({ workspace_id: '3', unit_id: unitId })))
        .rejects.toThrow(UnitNotFoundException);
      expect(unitService.isInWorkspace).not.toHaveBeenCalled();
    }
  );

  it('should throw UnitNotFoundException without a unit in the route', async () => {
    await expect(guard.canActivate(contextFor({ workspace_id: '3' })))
      .rejects.toThrow(UnitNotFoundException);
    expect(unitService.isInWorkspace).not.toHaveBeenCalled();
  });

  it('should report a malformed unit as unit 0, not as what Number makes of it', async () => {
    await expect(guard.canActivate(contextFor({ workspace_id: '3', unit_id: '0xa' })))
      .rejects.toMatchObject({ response: { id: 0 } });
  });

  it('should name the unit, the workspace and the method in the exception', async () => {
    unitService.isInWorkspace.mockResolvedValue(false);

    await expect(guard.canActivate(contextFor({ workspace_id: '7', unit_id: '10' }, 'POST')))
      .rejects.toMatchObject({ response: { id: 10, method: 'POST' } });
  });
});
