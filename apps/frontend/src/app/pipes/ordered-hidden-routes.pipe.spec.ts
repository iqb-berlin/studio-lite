import { OrderedHiddenRoutesPipe } from './ordered-hidden-routes.pipe';

describe('OrderedHiddenRoutesPipe', () => {
  const pipe = new OrderedHiddenRoutesPipe();

  it('lists the hidden routes in the order of the settings dialog, not in the order they were stored', () => {
    expect(pipe.transform(['comments', 'metadata', 'schemer'])).toEqual(['metadata', 'schemer', 'comments']);
  });

  it('leaves out what is no hideable route', () => {
    expect(pipe.transform(['properties', 'notes', 'print'])).toEqual(['notes']);
  });

  it('gives nothing for a workspace without hidden routes', () => {
    expect(pipe.transform(undefined)).toEqual([]);
    expect(pipe.transform([])).toEqual([]);
  });
});
