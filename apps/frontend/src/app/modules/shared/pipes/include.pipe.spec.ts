import { IncludePipe } from './include.pipe';

describe('IncludePipe', () => {
  const pipe = new IncludePipe();

  it('should be defined', () => {
    expect(pipe).toBeDefined();
  });

  it('should return true if value is in array', () => {
    expect(pipe.transform([1, 2, 3], 2)).toBe(true);
  });

  it('should return false if value is not in array', () => {
    expect(pipe.transform([1, 2, 3], 4)).toBe(false);
  });

  it('should return false if array is null', () => {
    expect(pipe.transform(null as unknown as number[], 1)).toBe(false);
  });
});
