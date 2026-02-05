import { NamedRouterLinkPipe } from './named-router-link.pipe';

describe('NamedRouterLinkPipe', () => {
  let pipe: NamedRouterLinkPipe;

  beforeEach(() => {
    pipe = new NamedRouterLinkPipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should create router link with outlet and path', () => {
    const outletName = 'sidebar';
    const path = 'settings';
    const result = pipe.transform(outletName, path);

    expect(result).toEqual([
      {
        outlets: {
          sidebar: ['settings']
        }
      }
    ]);
  });

  it('should handle different outlet names', () => {
    const outletName = 'content';
    const path = 'dashboard';
    const result = pipe.transform(outletName, path);

    expect(result).toEqual([
      {
        outlets: {
          content: ['dashboard']
        }
      }
    ]);
  });

  it('should handle paths with special characters', () => {
    const outletName = 'main';
    const path = 'user/profile/123';
    const result = pipe.transform(outletName, path);

    expect(result).toEqual([
      {
        outlets: {
          main: ['user/profile/123']
        }
      }
    ]);
  });

  it('should handle empty path', () => {
    const outletName = 'outlet1';
    const path = '';
    const result = pipe.transform(outletName, path);

    expect(result).toEqual([
      {
        outlets: {
          outlet1: ['']
        }
      }
    ]);
  });

  it('should handle paths with parameters', () => {
    const outletName = 'workspace';
    const path = 'unit/42';
    const result = pipe.transform(outletName, path);

    expect(result).toEqual([
      {
        outlets: {
          workspace: ['unit/42']
        }
      }
    ]);
  });

  it('should return array with single element', () => {
    const result = pipe.transform('test', 'path');

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(1);
  });

  it('should have correct structure with outlets property', () => {
    const result = pipe.transform('myOutlet', 'myPath');

    expect(result[0]).toHaveProperty('outlets');
    expect(typeof result[0].outlets).toBe('object');
  });

  it('should place path in array', () => {
    const result = pipe.transform('test', 'testPath');
    /* eslint-disable-next-line @typescript-eslint/dot-notation */
    expect(Array.isArray(result[0].outlets['test'])).toBe(true);
    /* eslint-disable-next-line @typescript-eslint/dot-notation */
    expect(result[0].outlets['test'][0]).toBe('testPath');
  });
});
