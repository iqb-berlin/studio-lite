import { IsCurrentProfilePipe } from './is-current-profile.pipe';

describe('IsCurrentProfilePipe', () => {
  let pipe: IsCurrentProfilePipe;

  beforeEach(() => {
    pipe = new IsCurrentProfilePipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return true for a visible profile (order 0)', () => {
    expect(pipe.transform(0)).toBe(true);
  });

  it('should return true for any non-negative order (position)', () => {
    expect(pipe.transform(2)).toBe(true);
  });

  it('should return false for a hidden profile (order -1)', () => {
    expect(pipe.transform(-1)).toBe(false);
  });

  it('should treat null/undefined as hidden', () => {
    expect(pipe.transform(null)).toBe(false);
    expect(pipe.transform(undefined)).toBe(false);
  });
});
