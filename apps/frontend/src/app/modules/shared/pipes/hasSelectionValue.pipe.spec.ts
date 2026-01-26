import { SelectionModel } from '@angular/cdk/collections';
import { HasSelectionValuePipe } from './hasSelectionValue.pipe';

describe('HasSelectionValuePipe', () => {
  const pipe = new HasSelectionValuePipe();

  it('should be defined', () => {
    expect(pipe).toBeDefined();
  });

  it('should return true if selectionLength > 0 and selectionModel has value', () => {
    const selection = new SelectionModel<number>(true, [1]);
    expect(pipe.transform(selection, 1)).toBe(true);
  });

  it('should return false if selectionLength is 0', () => {
    const selection = new SelectionModel<number>(true, [1]);
    expect(pipe.transform(selection, 0)).toBe(false);
  });

  it('should return false if selectionModel has no value', () => {
    const selection = new SelectionModel<number>(true, []);
    expect(pipe.transform(selection, 1)).toBe(false);
  });
});
