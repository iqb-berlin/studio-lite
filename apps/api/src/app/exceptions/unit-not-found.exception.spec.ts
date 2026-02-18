import { UnitNotFoundException } from './unit-not-found.exception';

describe('UnitNotFoundException', () => {
  it('should be defined', () => {
    const exception = new UnitNotFoundException(1, 2, 'GET');
    expect(exception).toBeDefined();
    expect(exception.getStatus()).toBe(404);
    expect(exception.getResponse()).toEqual({
      id: 1,
      controller: 'workspace-unit',
      method: 'GET',
      description: 'Unit with id 1 not found in workspace with id 2'
    });
  });
});
