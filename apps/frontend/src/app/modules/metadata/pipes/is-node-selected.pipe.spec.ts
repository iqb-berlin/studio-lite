import { SelectionModel } from '@angular/cdk/collections';
import { IsNodeSelectedPipe } from './is-node-selected.pipe';
import { VocabFlatNode } from '../models/vocabulary.class';

describe('IsNodeSelectedPipe', () => {
  let pipe: IsNodeSelectedPipe;
  let selectionModel: SelectionModel<VocabFlatNode>;

  beforeEach(() => {
    pipe = new IsNodeSelectedPipe();
    selectionModel = new SelectionModel<VocabFlatNode>(true);
  });

  it('should be defined', () => {
    expect(pipe).toBeDefined();
  });

  it('should return true if node is selected', () => {
    const node = { id: '1' } as VocabFlatNode;
    jest.spyOn(selectionModel, 'isSelected').mockReturnValue(true);

    expect(pipe.transform(selectionModel, node, false)).toBe(true);
    expect(selectionModel.isSelected).toHaveBeenCalledWith(node);
  });

  it('should return false if node is not selected', () => {
    const node = { id: '1' } as VocabFlatNode;
    jest.spyOn(selectionModel, 'isSelected').mockReturnValue(false);

    expect(pipe.transform(selectionModel, node, false)).toBe(false);
    expect(selectionModel.isSelected).toHaveBeenCalledWith(node);
  });
});
