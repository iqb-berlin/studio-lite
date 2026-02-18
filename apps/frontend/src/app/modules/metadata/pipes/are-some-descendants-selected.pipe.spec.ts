import { FlatTreeControl } from '@angular/cdk/tree';
import { SelectionModel } from '@angular/cdk/collections';
import { AreSomeDescendantsSelectedPipe } from './are-some-descendants-selected.pipe';
import { VocabFlatNode } from '../models/vocabulary.class';
import { AreAllDescendantsSelectedPipe } from './are-all-descendants-selected.pipe';

describe('AreSomeDescendantsSelectedPipe', () => {
  let pipe: AreSomeDescendantsSelectedPipe;
  let treeControl: FlatTreeControl<VocabFlatNode, VocabFlatNode>;
  let selectionModel: SelectionModel<VocabFlatNode>;

  beforeEach(() => {
    pipe = new AreSomeDescendantsSelectedPipe();
    treeControl = new FlatTreeControl<VocabFlatNode, VocabFlatNode>(
      node => node.level,
      node => node.expandable
    );
    selectionModel = new SelectionModel<VocabFlatNode>(true);
  });

  it('should be defined', () => {
    expect(pipe).toBeDefined();
  });

  it('should return true if some descendants are selected but not all', () => {
    const node = { id: '1', level: 0, expandable: true } as VocabFlatNode;
    const child1 = { id: '2', level: 1, expandable: false } as VocabFlatNode;
    const child2 = { id: '3', level: 1, expandable: false } as VocabFlatNode;

    jest.spyOn(treeControl, 'getDescendants').mockReturnValue([child1, child2]);
    jest.spyOn(selectionModel, 'isSelected').mockImplementation(n => n.id === '2');
    jest.spyOn(AreAllDescendantsSelectedPipe, 'check').mockReturnValue(false);

    expect(pipe.transform(treeControl, selectionModel, node, false)).toBe(true);
  });

  it('should return false if all descendants are selected', () => {
    const node = { id: '1', level: 0, expandable: true } as VocabFlatNode;
    const child1 = { id: '2', level: 1, expandable: false } as VocabFlatNode;
    const child2 = { id: '3', level: 1, expandable: false } as VocabFlatNode;

    jest.spyOn(treeControl, 'getDescendants').mockReturnValue([child1, child2]);
    jest.spyOn(selectionModel, 'isSelected').mockReturnValue(true);
    jest.spyOn(AreAllDescendantsSelectedPipe, 'check').mockReturnValue(true);

    expect(pipe.transform(treeControl, selectionModel, node, false)).toBe(false);
  });

  it('should return false if no descendants are selected', () => {
    const node = { id: '1', level: 0, expandable: true } as VocabFlatNode;
    const child1 = { id: '2', level: 1, expandable: false } as VocabFlatNode;
    const child2 = { id: '3', level: 1, expandable: false } as VocabFlatNode;

    jest.spyOn(treeControl, 'getDescendants').mockReturnValue([child1, child2]);
    jest.spyOn(selectionModel, 'isSelected').mockReturnValue(false);
    jest.spyOn(AreAllDescendantsSelectedPipe, 'check').mockReturnValue(false);

    expect(pipe.transform(treeControl, selectionModel, node, false)).toBe(false);
  });
});
