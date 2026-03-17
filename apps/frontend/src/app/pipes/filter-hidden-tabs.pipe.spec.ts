import { FilterHiddenTabsPipe } from './filter-hidden-tabs.pipe';

describe('FilterHiddenTabsPipe', () => {
  let pipe: FilterHiddenTabsPipe;

  beforeEach(() => {
    pipe = new FilterHiddenTabsPipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should filter hidden routes', () => {
    const tabs = [
      { name: 'properties', duplicable: false },
      { name: 'editor', duplicable: true },
      { name: 'preview', duplicable: true }
    ];
    const hiddenRoutes = ['preview'];
    const result = pipe.transform(tabs, hiddenRoutes);
    expect(result.length).toBe(2);
    expect(result.find(t => t.name === 'preview')).toBeUndefined();
    expect(result.find(t => t.name === 'editor')).toBeDefined();
  });

  it('should return all tabs if hiddenRoutes is undefined', () => {
    const tabs = [{ name: 'editor', duplicable: true }];
    expect(pipe.transform(tabs, undefined)).toEqual(tabs);
  });

  it('should return empty if tabs is undefined', () => {
    expect(pipe.transform(undefined, [])).toEqual([]);
  });
});
