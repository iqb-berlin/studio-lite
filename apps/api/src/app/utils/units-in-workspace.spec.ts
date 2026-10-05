import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { assertUnitsInWorkspace } from './units-in-workspace';
import { UnitService } from '../services/unit.service';
import { UnitNotFoundException } from '../exceptions/unit-not-found.exception';

describe('assertUnitsInWorkspace', () => {
  let unitService: DeepMocked<UnitService>;

  beforeEach(() => {
    unitService = createMock<UnitService>();
    unitService.idsNotInWorkspace.mockResolvedValue([]);
  });

  it('should pass when every unit is in the workspace', async () => {
    await expect(assertUnitsInWorkspace(unitService, [10, 11], 3, 'PATCH')).resolves.toBeUndefined();
    expect(unitService.idsNotInWorkspace).toHaveBeenCalledWith([10, 11], 3);
  });

  it('should pass an empty list', async () => {
    await expect(assertUnitsInWorkspace(unitService, [], 3, 'PATCH')).resolves.toBeUndefined();
  });

  it('should refuse a malformed id without asking the database', async () => {
    await expect(assertUnitsInWorkspace(unitService, [10, 0], 3, 'DELETE'))
      .rejects.toThrow(new UnitNotFoundException(0, 3, 'DELETE'));
    expect(unitService.idsNotInWorkspace).not.toHaveBeenCalled();
  });

  it('should refuse with the first unit that is not in the workspace', async () => {
    unitService.idsNotInWorkspace.mockResolvedValue([11, 12]);

    await expect(assertUnitsInWorkspace(unitService, [10, 11, 12], 3, 'PATCH'))
      .rejects.toThrow(new UnitNotFoundException(11, 3, 'PATCH'));
  });
});
