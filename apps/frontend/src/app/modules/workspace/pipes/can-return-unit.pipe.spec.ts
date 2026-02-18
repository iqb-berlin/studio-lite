import { UnitInListDto } from '@studio-lite-lib/api-dto';
import { CanReturnUnitPipe } from './can-return-unit.pipe';

describe('CanReturnUnitPipe', () => {
  let pipe: CanReturnUnitPipe;

  beforeEach(() => {
    pipe = new CanReturnUnitPipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return true when unit has sourceWorkspaceId and is not returned', () => {
    const unitId = 1;
    const unitList: { [key: string]: UnitInListDto[] } = {
      group1: [
        {
          id: 1,
          key: 'unit1',
          sourceWorkspaceId: 5,
          returned: false
        } as UnitInListDto
      ]
    };

    expect(pipe.transform(unitId, unitList)).toBe(true);
  });

  it('should return false when unit has sourceWorkspaceId but is already returned', () => {
    const unitId = 1;
    const unitList: { [key: string]: UnitInListDto[] } = {
      group1: [
        {
          id: 1,
          key: 'unit1',
          sourceWorkspaceId: 5,
          returned: true
        } as UnitInListDto
      ]
    };

    expect(pipe.transform(unitId, unitList)).toBe(false);
  });

  it('should return false when unit does not have sourceWorkspaceId', () => {
    const unitId = 1;
    const unitList: { [key: string]: UnitInListDto[] } = {
      group1: [
        {
          id: 1,
          key: 'unit1',
          sourceWorkspaceId: undefined,
          returned: false
        } as UnitInListDto
      ]
    };

    expect(pipe.transform(unitId, unitList)).toBe(false);
  });

  it('should return false when unit is not found in unitList', () => {
    const unitId = 999;
    const unitList: { [key: string]: UnitInListDto[] } = {
      group1: [
        {
          id: 1,
          key: 'unit1',
          sourceWorkspaceId: 5,
          returned: false
        } as UnitInListDto
      ]
    };

    expect(pipe.transform(unitId, unitList)).toBe(false);
  });

  it('should handle multiple groups in unitList', () => {
    const unitId = 2;
    const unitList: { [key: string]: UnitInListDto[] } = {
      group1: [
        {
          id: 1,
          key: 'unit1',
          sourceWorkspaceId: 5,
          returned: false
        } as UnitInListDto
      ],
      group2: [
        {
          id: 2,
          key: 'unit2',
          sourceWorkspaceId: 10,
          returned: false
        } as UnitInListDto
      ]
    };

    expect(pipe.transform(unitId, unitList)).toBe(true);
  });

  it('should handle empty unitList', () => {
    const unitId = 1;
    const unitList: { [key: string]: UnitInListDto[] } = {};

    expect(pipe.transform(unitId, unitList)).toBe(false);
  });

  it('should handle unitList with empty groups', () => {
    const unitId = 1;
    const unitList: { [key: string]: UnitInListDto[] } = {
      group1: []
    };

    expect(pipe.transform(unitId, unitList)).toBe(false);
  });

  it('should return false when sourceWorkspaceId is 0', () => {
    const unitId = 1;
    const unitList: { [key: string]: UnitInListDto[] } = {
      group1: [
        {
          id: 1,
          key: 'unit1',
          sourceWorkspaceId: 0,
          returned: false
        } as UnitInListDto
      ]
    };

    expect(pipe.transform(unitId, unitList)).toBe(false);
  });
});
