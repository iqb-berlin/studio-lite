import { UnitItemNotFoundException } from './unit-item-not-found.exception';

describe('UnitItemNotFoundException', () => {
  it('should be defined', () => {
    const exception = new UnitItemNotFoundException('uuid-1', 'GET');
    expect(exception).toBeDefined();
    expect(exception.getStatus()).toBe(404);
    expect(exception.getResponse()).toEqual({
      uuid: 'uuid-1',
      controller: 'item-comment',
      method: 'GET',
      description: 'Unit item with uuid uuid-1 not found'
    });
  });
});
