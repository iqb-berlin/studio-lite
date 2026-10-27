import { CastPipe } from './cast.pipe';

describe('CastPipe', () => {
  const pipe = new CastPipe();

  it('should return the same value', () => {
    const value = { a: 1 };
    expect(pipe.transform(value, value)).toBe(value);
  });
});
