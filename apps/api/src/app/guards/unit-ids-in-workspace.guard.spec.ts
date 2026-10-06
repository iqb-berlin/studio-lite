import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { UnitIdsInWorkspaceGuard } from './unit-ids-in-workspace.guard';
import { UnitService } from '../services/unit.service';
import { UnitNotFoundException } from '../exceptions/unit-not-found.exception';

/** Takes the body as its list of units, so the tests hand over the ids as they are to be checked. */
@Injectable()
class BodyUnitsInWorkspaceGuard extends UnitIdsInWorkspaceGuard {
  constructor(unitService: UnitService) {
    super(unitService, (req: Request) => req.body);
  }
}

describe('UnitIdsInWorkspaceGuard', () => {
  let guard: BodyUnitsInWorkspaceGuard;
  let unitService: DeepMocked<UnitService>;

  const contextFor = (unitIds: number[], method = 'PATCH'): ExecutionContext => createMock<ExecutionContext>({
    switchToHttp: () => ({
      getRequest: () => ({ params: { workspace_id: '3' }, method, body: unitIds })
    })
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: UnitService,
          useValue: createMock<UnitService>()
        },
        BodyUnitsInWorkspaceGuard
      ]
    }).compile();

    guard = module.get<BodyUnitsInWorkspaceGuard>(BodyUnitsInWorkspaceGuard);
    unitService = module.get(UnitService);
    unitService.idsNotInWorkspace.mockResolvedValue([]);
  });

  it('should pass when every unit is in the workspace of the route', async () => {
    expect(await guard.canActivate(contextFor([10, 11]))).toBe(true);
    expect(unitService.idsNotInWorkspace).toHaveBeenCalledWith([10, 11], 3);
  });

  it('should pass an empty list', async () => {
    expect(await guard.canActivate(contextFor([]))).toBe(true);
  });

  it('should refuse a malformed id without asking the database', async () => {
    await expect(guard.canActivate(contextFor([10, 0], 'DELETE')))
      .rejects.toThrow(new UnitNotFoundException(0, 3, 'DELETE'));
    expect(unitService.idsNotInWorkspace).not.toHaveBeenCalled();
  });

  it('should refuse with the first unit that is not in the workspace', async () => {
    unitService.idsNotInWorkspace.mockResolvedValue([11, 12]);

    await expect(guard.canActivate(contextFor([10, 11, 12])))
      .rejects.toThrow(new UnitNotFoundException(11, 3, 'PATCH'));
  });
});
