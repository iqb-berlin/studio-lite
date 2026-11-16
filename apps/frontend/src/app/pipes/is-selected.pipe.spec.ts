import { SelectionModel } from '@angular/cdk/collections';
import { IsSelectedPipe } from './is-selected.pipe';

describe('IsSelectedPipe', () => {
  const pipe = new IsSelectedPipe();

  it('should return true if element is selected', () => {
    const selection = new SelectionModel<number>(true, [1, 2]);
    expect(pipe.transform(selection, 1, selection.selected)).toBe(true);
  });

  it('should return false if element is not selected', () => {
    const selection = new SelectionModel<number>(true, [1, 2]);
    expect(pipe.transform(selection, 3, selection.selected)).toBe(false);
  });
});
