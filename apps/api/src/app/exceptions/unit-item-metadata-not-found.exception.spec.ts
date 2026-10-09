import { UnitItemMetadataNotFoundException } from './unit-item-metadata-not-found.exception';

describe('UnitItemMetadataNotFoundException', () => {
  it('should be defined', () => {
    const exception = new UnitItemMetadataNotFoundException(1, 'DELETE');
    expect(exception).toBeDefined();
    expect(exception.getStatus()).toBe(404);
    expect(exception.getResponse()).toEqual({
      id: 1,
      controller: 'unit-item-metadata',
      method: 'DELETE',
      description: 'Unit item metadata with id 1 not found'
    });
  });
});
