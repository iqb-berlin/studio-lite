import { readSpecVersion } from './spec-version.utils';

describe('readSpecVersion', () => {
  it.each([
    ['the spec version in the metadata', { metadata: { specVersion: '4.6' } }, 4],
    ['the API version of an older module', { apiVersion: '3.0.0' }, 3],
    ['a spec version beside the metadata', { specVersion: '2.1' }, 2],
    ['metadata without a spec version, beside an API version', { metadata: {}, apiVersion: '1.1.0' }, 1]
  ])('should read %s', (_, message, version) => {
    expect(readSpecVersion(message)).toBe(version);
  });

  // An editor that names no readable version used to throw before it got its unit (#2007).
  it.each([
    ['nothing', {}],
    ['empty metadata', { metadata: {} }],
    ['a version without a digit', { metadata: { specVersion: 'latest' } }],
    ['a version that is not a string', { apiVersion: 5 }]
  ])('should answer undefined for %s', (_, message) => {
    expect(readSpecVersion(message)).toBeUndefined();
  });
});
