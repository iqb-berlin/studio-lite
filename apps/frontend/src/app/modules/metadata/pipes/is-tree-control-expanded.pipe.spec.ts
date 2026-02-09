import { FlatTreeControl } from '@angular/cdk/tree';
import { IsTreeControlExpandedPipe } from './is-tree-control-expanded.pipe';
import { VocabFlatNode } from '../models/vocabulary.class';

describe('IsTreeControlExpandedPipe', () => {
  let pipe: IsTreeControlExpandedPipe;
  let treeControl: FlatTreeControl<VocabFlatNode, VocabFlatNode>;

  beforeEach(() => {
    pipe = new IsTreeControlExpandedPipe();
    treeControl = new FlatTreeControl<VocabFlatNode, VocabFlatNode>(
      node => node.level,
      node => node.expandable
    );
  });

  it('should be defined', () => {
    expect(pipe).toBeDefined();
  });

  it('should return true if node is expanded', () => {
    const node = { id: '1' } as VocabFlatNode;
    jest.spyOn(treeControl, 'isExpanded').mockReturnValue(true);

    expect(pipe.transform(treeControl, node, false)).toBe(true);
    expect(treeControl.isExpanded).toHaveBeenCalledWith(node);
  });

  it('should return false if node is not expanded', () => {
    const node = { id: '1' } as VocabFlatNode;
    jest.spyOn(treeControl, 'isExpanded').mockReturnValue(false);

    expect(pipe.transform(treeControl, node, false)).toBe(false);
    expect(treeControl.isExpanded).toHaveBeenCalledWith(node);
  });
});
