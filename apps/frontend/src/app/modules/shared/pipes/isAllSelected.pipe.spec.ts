import { IsAllSelectedPipe } from './isAllSelected.pipe';

describe('IsAllSelectedPipe', () => {
  const pipe = new IsAllSelectedPipe();

  it('should be defined', () => {
    expect(pipe).toBeDefined();
  });

  it('should return true if selectionCount equals total', () => {
    expect(pipe.transform(5, 5)).toBe(true);
    expect(IsAllSelectedPipe.isAllSelected(5, 5)).toBe(true);
  });

  it('should return false if selectionCount does not equal total', () => {
    expect(pipe.transform(3, 5)).toBe(false);
    expect(IsAllSelectedPipe.isAllSelected(3, 5)).toBe(false);
  });
});
