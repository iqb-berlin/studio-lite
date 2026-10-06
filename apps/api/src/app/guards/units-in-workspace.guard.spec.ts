import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { UnitsInWorkspaceGuard } from './units-in-workspace.guard';
import { UnitService } from '../services/unit.service';
import { UnitNotFoundException } from '../exceptions/unit-not-found.exception';

describe('UnitsInWorkspaceGuard', () => {
  let guard: UnitsInWorkspaceGuard;
  let unitService: DeepMocked<UnitService>;

  const contextFor = (
    request: { body?: unknown; query?: Record<string, unknown> },
    method = 'PATCH'
  ): ExecutionContext => createMock<ExecutionContext>({
    switchToHttp: () => ({
      getRequest: () => ({
        user: { id: 1 }, params: { workspace_id: '3' }, method, query: {}, ...request
      })
    })
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: UnitService,
          useValue: createMock<UnitService>()
        },
        UnitsInWorkspaceGuard
      ]
    }).compile();

    guard = module.get<UnitsInWorkspaceGuard>(UnitsInWorkspaceGuard);
    unitService = module.get(UnitService);
    unitService.idsNotInWorkspace.mockResolvedValue([]);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should pass when all units of the body are in the workspace of the route', async () => {
    expect(await guard.canActivate(contextFor({ body: { ids: [10, 11], targetId: 7 } }))).toBe(true);
    expect(unitService.idsNotInWorkspace).toHaveBeenCalledWith([10, 11], 3);
  });

  it('should read ids written as text', async () => {
    expect(await guard.canActivate(contextFor({ body: { ids: ['10'] } }))).toBe(true);
    expect(unitService.idsNotInWorkspace).toHaveBeenCalledWith([10], 3);
  });

  it('should pass an empty list of the body', async () => {
    expect(await guard.canActivate(contextFor({ body: { ids: [] } }))).toBe(true);
  });

  it('should check the body, not a query sent along', async () => {
    unitService.idsNotInWorkspace.mockResolvedValue([11]);

    await expect(guard.canActivate(contextFor({ body: { ids: [11] }, query: { id: '10' } })))
      .rejects.toThrow(UnitNotFoundException);
    expect(unitService.idsNotInWorkspace).toHaveBeenCalledWith([11], 3);
  });

  it('should throw UnitNotFoundException for the first unit that is not in the workspace', async () => {
    unitService.idsNotInWorkspace.mockResolvedValue([11]);

    await expect(guard.canActivate(contextFor({ body: { ids: [10, 11] } })))
      .rejects.toMatchObject({ response: { id: 11, method: 'PATCH' } });
  });

  it.each([
    [{ ids: [10, 'abc'] }],
    [{ ids: [10, 0] }],
    [{ ids: [10, 1.5] }],
    [{ ids: [10, -1] }],
    [{ ids: '10' }],
    [{ targetId: 7 }]
  ])('should throw UnitNotFoundException for the body %p without looking it up', async body => {
    await expect(guard.canActivate(contextFor({ body })))
      .rejects.toThrow(UnitNotFoundException);
    expect(unitService.idsNotInWorkspace).not.toHaveBeenCalled();
  });

  it('should not fall back on the query without a list in the body', async () => {
    await expect(guard.canActivate(contextFor({ body: { targetId: 7 }, query: { id: '10' } })))
      .rejects.toThrow(UnitNotFoundException);
    expect(unitService.idsNotInWorkspace).not.toHaveBeenCalled();
  });
});
