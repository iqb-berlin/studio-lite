import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { QueryUnitsInWorkspaceGuard } from './query-units-in-workspace.guard';
import { UnitService } from '../services/unit.service';
import { UnitNotFoundException } from '../exceptions/unit-not-found.exception';

describe('QueryUnitsInWorkspaceGuard', () => {
  let guard: QueryUnitsInWorkspaceGuard;
  let unitService: DeepMocked<UnitService>;

  const contextFor = (
    request: { body?: unknown; query?: Record<string, unknown> },
    method = 'DELETE'
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
        QueryUnitsInWorkspaceGuard
      ]
    }).compile();

    guard = module.get<QueryUnitsInWorkspaceGuard>(QueryUnitsInWorkspaceGuard);
    unitService = module.get(UnitService);
    unitService.idsNotInWorkspace.mockResolvedValue([]);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should pass when all units of the query are in the workspace of the route', async () => {
    expect(await guard.canActivate(contextFor({ query: { id: '10,11' } }))).toBe(true);
    expect(unitService.idsNotInWorkspace).toHaveBeenCalledWith([10, 11], 3);
  });

  it('should read a repeated query parameter as one list', async () => {
    expect(await guard.canActivate(contextFor({ query: { id: ['10', '11,12'] } }))).toBe(true);
    expect(unitService.idsNotInWorkspace).toHaveBeenCalledWith([10, 11, 12], 3);
  });

  // The route deletes the units of the query; a body sent along must not be what is checked.
  it('should check the query, not a body sent along', async () => {
    unitService.idsNotInWorkspace.mockResolvedValue([11]);

    await expect(guard.canActivate(contextFor({ query: { id: '11' }, body: { ids: [10] } })))
      .rejects.toMatchObject({ response: { id: 11, method: 'DELETE' } });
    expect(unitService.idsNotInWorkspace).toHaveBeenCalledWith([11], 3);
  });

  it.each(['abc', '10,abc', '010', '10,', ' 10', '0xa'])(
    'should throw UnitNotFoundException for the query %p without looking it up',
    async id => {
      await expect(guard.canActivate(contextFor({ query: { id } })))
        .rejects.toThrow(UnitNotFoundException);
      expect(unitService.idsNotInWorkspace).not.toHaveBeenCalled();
    }
  );

  it('should throw UnitNotFoundException without units in the query', async () => {
    await expect(guard.canActivate(contextFor({ body: { ids: [10] } })))
      .rejects.toThrow(UnitNotFoundException);
    expect(unitService.idsNotInWorkspace).not.toHaveBeenCalled();
  });
});
