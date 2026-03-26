import { SortAscendingPipe } from './sort-ascending.pipe';

describe('SortAscendingPipe', () => {
  let pipe: SortAscendingPipe;

  beforeEach(() => {
    pipe = new SortAscendingPipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should sort an array of objects by a string key in ascending order', () => {
    const items = [
      { name: 'Banana' },
      { name: 'Apple' },
      { name: 'Cherry' }
    ];
    const result = pipe.transform(items, 'name');
    expect(result).toEqual([
      { name: 'Apple' },
      { name: 'Banana' },
      { name: 'Cherry' }
    ]);
  });

  it('should handle undefined or null values by placing them at the end', () => {
    const items = [
      { name: 'Banana' },
      { name: null },
      { name: 'Apple' }
    ];
    // Based on the implementation: if (!a[key]) return 1; if (!b[key]) return -1;
    // null/undefined are pushed to the end.
    const result = pipe.transform(items, 'name');
    expect(result[0].name).toBe('Apple');
    expect(result[1].name).toBe('Banana');
    expect(result[2].name).toBeNull();
  });

  it('should return 0 for equal values', () => {
    const items = [
      { name: 'Apple' },
      { name: 'Apple' }
    ];
    const result = pipe.transform(items, 'name');
    expect(result).toEqual([
      { name: 'Apple' },
      { name: 'Apple' }
    ]);
  });
});
