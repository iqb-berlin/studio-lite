import { DataLoadingIsNumberPipe } from './data-loading-is-number.pipe';

describe('DataLoadingIsNumberPipe', () => {
  let pipe: DataLoadingIsNumberPipe;

  beforeEach(() => {
    pipe = new DataLoadingIsNumberPipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return true when value is a number', () => {
    expect(pipe.transform(0)).toBe(true);
    expect(pipe.transform(1)).toBe(true);
    expect(pipe.transform(100)).toBe(true);
    expect(pipe.transform(-1)).toBe(true);
    expect(pipe.transform(3.14)).toBe(true);
  });

  it('should return false when value is boolean true', () => {
    expect(pipe.transform(true)).toBe(false);
  });

  it('should return false when value is boolean false', () => {
    expect(pipe.transform(false)).toBe(false);
  });
});
