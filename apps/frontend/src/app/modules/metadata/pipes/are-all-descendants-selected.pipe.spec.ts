import { FlatTreeControl } from '@angular/cdk/tree';
import { SelectionModel } from '@angular/cdk/collections';
import { AreAllDescendantsSelectedPipe } from './are-all-descendants-selected.pipe';
import { VocabFlatNode } from '../models/vocabulary.class';

describe('AreAllDescendantsSelectedPipe', () => {
  let pipe: AreAllDescendantsSelectedPipe;
  let treeControl: FlatTreeControl<VocabFlatNode, VocabFlatNode>;
  let selectionModel: SelectionModel<VocabFlatNode>;

  beforeEach(() => {
    pipe = new AreAllDescendantsSelectedPipe();
    treeControl = new FlatTreeControl<VocabFlatNode, VocabFlatNode>(
      node => node.level,
      node => node.expandable
    );
    selectionModel = new SelectionModel<VocabFlatNode>(true);
  });

  it('should be defined', () => {
    expect(pipe).toBeDefined();
  });

  it('should return true if all descendants are selected', () => {
    const node = { id: '1', level: 0, expandable: true } as VocabFlatNode;
    const child1 = { id: '2', level: 1, expandable: false } as VocabFlatNode;
    const child2 = { id: '3', level: 1, expandable: false } as VocabFlatNode;

    jest.spyOn(treeControl, 'getDescendants').mockReturnValue([child1, child2]);
    jest.spyOn(selectionModel, 'isSelected').mockReturnValue(true);

    expect(pipe.transform(treeControl, selectionModel, node, false)).toBe(true);
  });

  it('should return false if some descendants are not selected', () => {
    const node = { id: '1', level: 0, expandable: true } as VocabFlatNode;
    const child1 = { id: '2', level: 1, expandable: false } as VocabFlatNode;
    const child2 = { id: '3', level: 1, expandable: false } as VocabFlatNode;

    jest.spyOn(treeControl, 'getDescendants').mockReturnValue([child1, child2]);
    jest.spyOn(selectionModel, 'isSelected').mockImplementation(n => n.id === '2');

    expect(pipe.transform(treeControl, selectionModel, node, false)).toBe(false);
  });

  it('should return false if there are no descendants', () => {
    const node = { id: '1', level: 0, expandable: true } as VocabFlatNode;

    jest.spyOn(treeControl, 'getDescendants').mockReturnValue([]);

    expect(pipe.transform(treeControl, selectionModel, node, false)).toBe(false);
  });
});
