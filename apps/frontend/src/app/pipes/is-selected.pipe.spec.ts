import { SelectionModel } from '@angular/cdk/collections';
import { IsSelectedPipe } from './is-selected.pipe';

describe('IsSelectedPipe', () => {
  const pipe = new IsSelectedPipe();

  it('should be defined', () => {
    expect(pipe).toBeDefined();
  });

  it('should return true if element is selected and selectionCount > 0', () => {
    const selection = new SelectionModel<number>(true, [1, 2]);
    expect(pipe.transform(selection, 1, 2)).toBe(true);
  });

  it('should return false if element is not selected', () => {
    const selection = new SelectionModel<number>(true, [1, 2]);
    expect(pipe.transform(selection, 3, 2)).toBe(false);
  });

  it('should return false if selectionCount is 0', () => {
    const selection = new SelectionModel<number>(true, [1, 2]);
    expect(pipe.transform(selection, 1, 0)).toBe(false);
  });
});
