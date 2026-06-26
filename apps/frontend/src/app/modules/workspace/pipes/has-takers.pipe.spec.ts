import { HasTakersPipe } from './has-takers.pipe';

describe('HasTakersPipe', () => {
  let pipe: HasTakersPipe;

  beforeEach(() => {
    pipe = new HasTakersPipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return false when all counts are 0', () => {
    expect(pipe.transform(0, 0, 0)).toBe(false);
  });

  it('should return true when review count > 0', () => {
    expect(pipe.transform(1, 0, 0)).toBe(true);
  });

  it('should return true when hot count > 0', () => {
    expect(pipe.transform(0, 2, 0)).toBe(true);
  });

  it('should return true when monitor count > 0', () => {
    expect(pipe.transform(0, 0, 1)).toBe(true);
  });

  it('should return true when multiple counts > 0', () => {
    expect(pipe.transform(2, 3, 1)).toBe(true);
  });
});
