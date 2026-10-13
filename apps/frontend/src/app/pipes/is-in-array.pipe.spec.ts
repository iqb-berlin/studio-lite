import { IsInArrayPipe } from './is-in-array.pipe';

describe('IsInArrayPipe', () => {
  let pipe: IsInArrayPipe;

  beforeEach(() => {
    pipe = new IsInArrayPipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return true when value is in the array', () => {
    expect(pipe.transform(1, [1, 2, 3])).toBe(true);
    expect(pipe.transform(2, [1, 2, 3])).toBe(true);
    expect(pipe.transform(3, [1, 2, 3])).toBe(true);
  });

  it('should return false when value is not in the array', () => {
    expect(pipe.transform(4, [1, 2, 3])).toBe(false);
    expect(pipe.transform(0, [1, 2, 3])).toBe(false);
    expect(pipe.transform(-1, [1, 2, 3])).toBe(false);
  });

  it('should return false when array is empty', () => {
    expect(pipe.transform(1, [])).toBe(false);
  });

  it('should handle single element array', () => {
    expect(pipe.transform(5, [5])).toBe(true);
    expect(pipe.transform(4, [5])).toBe(false);
  });

  it('should handle negative numbers', () => {
    expect(pipe.transform(-1, [-1, 0, 1])).toBe(true);
    expect(pipe.transform(-2, [-1, 0, 1])).toBe(false);
  });

  it('should handle zero', () => {
    expect(pipe.transform(0, [0, 1, 2])).toBe(true);
    expect(pipe.transform(0, [1, 2, 3])).toBe(false);
  });
});
