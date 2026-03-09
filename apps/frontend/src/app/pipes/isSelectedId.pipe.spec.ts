import { IsSelectedIdPipe } from './isSelectedId.pipe';

describe('IsSelectedIdPipe', () => {
  const pipe = new IsSelectedIdPipe();

  it('should be defined', () => {
    expect(pipe).toBeDefined();
  });

  it('should return true if element.id matches id', () => {
    expect(pipe.transform({ id: 1 }, 1)).toBe(true);
  });

  it('should return false if element.id does not match id', () => {
    expect(pipe.transform({ id: 2 }, 1)).toBe(false);
  });
});
