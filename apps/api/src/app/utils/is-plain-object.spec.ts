import { isPlainObject } from './is-plain-object';

describe('isPlainObject', () => {
  it('takes an object of named fields, and neither null nor a list nor a text', () => {
    expect(isPlainObject({ GeoGebra: 'GeoGebra-5.3' })).toBe(true);
    expect(isPlainObject({})).toBe(true);
    expect(isPlainObject(null)).toBe(false);
    expect(isPlainObject(['GeoGebra-5.3'])).toBe(false);
    expect(isPlainObject('GeoGebra')).toBe(false);
  });
});
