import { UnitKeyExistsException } from './unit-key-exists.exception';

describe('UnitKeyExistsException', () => {
  it('should be defined', () => {
    const exception = new UnitKeyExistsException(1, 2, 'M1_001');
    expect(exception).toBeDefined();
    expect(exception.getStatus()).toBe(409);
    expect(exception.getResponse()).toEqual({
      id: 1,
      controller: 'workspace-unit',
      method: 'PATCH',
      description: 'Unit key M1_001 is already used in workspace with id 2'
    });
  });
});
