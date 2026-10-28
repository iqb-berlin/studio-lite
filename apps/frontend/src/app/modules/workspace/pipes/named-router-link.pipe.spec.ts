import { NamedRouterLinkPipe } from './named-router-link.pipe';

describe('NamedRouterLinkPipe', () => {
  let pipe: NamedRouterLinkPipe;

  beforeEach(() => {
    pipe = new NamedRouterLinkPipe();
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
});
