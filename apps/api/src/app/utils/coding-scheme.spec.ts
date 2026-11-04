import { isCodingScheme } from './coding-scheme';

describe('isCodingScheme', () => {
  it('should take a scheme with a list of variable codings', () => {
    expect(isCodingScheme('{"variableCodings": []}')).toBe(true);
  });

  it.each(['{broken', 'null', '{}', '{"variableCodings": {}}'])('should refuse %s', text => {
    expect(isCodingScheme(text)).toBe(false);
  });
});
