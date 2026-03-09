import { IsArrayPipe } from './is-array.pipe';

describe('IsArrayPipe', () => {
  const pipe = new IsArrayPipe();

  it('should be defined', () => {
    expect(pipe).toBeDefined();
  });

  it('should return true for an array', () => {
    expect(pipe.transform([1, 2, 3])).toBe(true);
  });

  it('should return false for an object', () => {
    expect(pipe.transform({ a: 1 })).toBe(false);
  });

  it('should return false for a string', () => {
    expect(pipe.transform('array')).toBe(false);
  });

  it('should return false for null or undefined', () => {
    expect(pipe.transform(null)).toBe(false);
    expect(pipe.transform(undefined)).toBe(false);
  });
});
