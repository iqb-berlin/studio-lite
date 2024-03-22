// eslint-disable-next-line max-classes-per-file
import { SelectionModel } from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import {
  Component, Inject, Injectable, OnInit
} from '@angular/core';
import {
  MatTreeFlatDataSource, MatTreeFlattener, MatTree, MatTreeNodeDef, MatTreeNode, MatTreeNodeToggle, MatTreeNodePadding
} from '@angular/material/tree';
import { BehaviorSubject } from 'rxjs';
import {
  MAT_DIALOG_DATA, MatDialogContent, MatDialogActions, MatDialogClose
} from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { MatIcon } from '@angular/material/icon';
import { NgIf } from '@angular/common';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatIconButton, MatButton } from '@angular/material/button';
import {
  DialogData, VocabFlatNode, VocabNode, Vocabulary
} from '../../models/types';

@Injectable()
export class ChecklistDatabase {
  dataChange = new BehaviorSubject<VocabNode[]>([]);
  treeDepth: number = 1;

  get data(): VocabNode[] {
    return this.dataChange.value;
  }

  constructor(@Inject(MAT_DIALOG_DATA) public dialogData: DialogData) {
    this.initialize();
  }

  getTreeDepth(treeNodes:any) {
    const lengths = treeNodes.map((node:any) => {
      if (node.narrower === undefined) {
        return 1;
      }
      return this.getTreeDepth(node.narrower) + 1;
    });
    const max = Math.max(...lengths);
    return max;
  }

  makeTree(vocab: Vocabulary) {
    return vocab.hasTopConcept?.map(
      (topConcept: any) => {
        const treeDepth = 1;
        const foundNode = new VocabNode();
        this.dialogData.value.forEach((v: any) => {
          if (v.id === topConcept.id) {
            foundNode.id = v.id;
            foundNode.label = v.name.substring(v.name.indexOf(' ') + 1) || '';
            foundNode.notation = v.notation || '';
            foundNode.description = v.description || '';
            foundNode.children = topConcept.narrower && topConcept.narrower.length &&
              (treeDepth < this.dialogData.props.maxLevel || this.dialogData.props.maxLevel === 0) ?
              this.mapNarrower(
                topConcept.narrower, this.treeDepth
              ) : [];
          }
        });

        if (Object.keys(foundNode).length !== 0) {
          return foundNode;
        }

        const node = new VocabNode();
        node.id = topConcept.id;
        node.label = topConcept.prefLabel?.de || '';
        node.notation = topConcept.notation || '';
        node.description = topConcept.description || '';
        node.children = topConcept.narrower && topConcept.narrower.length &&
          (treeDepth < this.dialogData.props.maxLevel || this.dialogData.props.maxLevel === 0) ?
          this.mapNarrower(topConcept.narrower, this.treeDepth) : [];
        return node;
      }
    );
  }

  mapNarrower(
    nodes: VocabFlatNode[], treeDepth: number
  ) {
    const depth = treeDepth + 1;
    return nodes?.map((n: any) => {
      const foundNode = new VocabNode();
      this.dialogData.value.forEach((v: any) => {
        if (v.id === n.id) {
          foundNode.id = v.id;
          foundNode.label = v.name.substring(v.name.indexOf(' ') + 1) || '';
          foundNode.notation = v.notation || '';
          foundNode.description = v.description || '';
          foundNode.children = n.narrower && n.narrower.length &&
              (depth < this.dialogData.props.maxLevel || this.dialogData.props.maxLevel === 0) ? this.mapNarrower(
              n.narrower, depth
            ) : [];
        }
      });
      if (Object.keys(foundNode).length !== 0) {
        return foundNode;
      }
      const node = new VocabNode();
      node.id = n.id;
      node.label = n.prefLabel?.de || '';
      node.notation = n.notation || '';
      node.description = n.description || '';
      node.children = n.narrower &&
          (depth < this.dialogData.props.maxLevel || this.dialogData.props.maxLevel === 0) ?
        this.mapNarrower(n.narrower, depth) : [];
      return node;
    }
    );
  }

  initialize() {
    const vocabulary = this.dialogData.vocabularies
      ?.find((vocab: { url: string, data: Vocabulary }) => vocab.url === this.dialogData.props.url);
    if (vocabulary && vocabulary.data) {
      this.treeDepth = this.getTreeDepth(vocabulary.data.hasTopConcept);
      const tree = this.makeTree(vocabulary.data);
      this.dataChange.next(tree);
    }
  }
}

@Component({
  selector: 'studio-lite-nested-tree',
  templateUrl: './nested-tree.component.html',
  styleUrls: ['./nested-tree.component.scss'],
  providers: [ChecklistDatabase],
  standalone: true,
  imports: [MatDialogContent, MatTree, MatTreeNodeDef, MatTreeNode, MatTreeNodeToggle, MatTreeNodePadding, MatIconButton, MatCheckbox, NgIf, MatIcon, MatDialogActions, MatButton, MatDialogClose, TranslateModule]
})

export class NestedTreeComponent implements OnInit {
  /** Map from flat node to nested node. This helps us finding the nested node to be modified */
  flatNodeMap = new Map<VocabFlatNode, VocabNode>();

  /** Map from nested node to flattened node. This helps us to keep the same object for selection */
  nestedNodeMap = new Map<VocabNode, VocabFlatNode>();

  treeControl: FlatTreeControl<VocabFlatNode>;
  treeFlattener: MatTreeFlattener<VocabNode, VocabFlatNode>;
  dataSource: MatTreeFlatDataSource<VocabNode, VocabFlatNode>;
  vocabularyTitle = '';
  nodesList: VocabFlatNode[] = [];
  searchString = '';
  checklistSelection = new SelectionModel<VocabFlatNode>(true /* multiple */);

  constructor(private _database: ChecklistDatabase, @Inject(MAT_DIALOG_DATA) public dialogData: DialogData) {
    this.treeFlattener = new MatTreeFlattener(this.transformer, this.getLevel, this.isExpandable, this.getChildren);
    this.treeControl = new FlatTreeControl<VocabFlatNode>(this.getLevel, this.isExpandable);
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
    _database.dataChange.subscribe(data => {
      this.dataSource.data = data;
    });
  }

  ngOnInit() {
    const vocabulary = this.dialogData.vocabularies
      ?.find((vocab: { url: string, data: Vocabulary }) => vocab.url === this.dialogData.props.url);
    if (vocabulary && vocabulary.data) {
      this.vocabularyTitle = vocabulary.data.title.de;
    }
    if (this.dialogData && this.dialogData.value) {
      this.dialogData.value.forEach((v: VocabFlatNode) => {
        this.treeControl.dataNodes.forEach(node => {
          if (node.id === v.id) {
            this.VocabNodeSelectionToggle(node);
          }
        });
      });
    }
  }

  // eslint-disable-next-line class-methods-use-this
  getLevel = (node: VocabFlatNode) => node.level;

  // eslint-disable-next-line class-methods-use-this
  isExpandable = (node: VocabFlatNode) => node.expandable;

  // eslint-disable-next-line class-methods-use-this
  getChildren = (node: VocabNode): VocabNode[] => node.children;

  // eslint-disable-next-line class-methods-use-this
  hasChild = (_: number, _nodeData: VocabFlatNode) => _nodeData.expandable;

  /**
   * Transformer to convert nested node to flat node. Record the nodes in maps for later use.
   */
  transformer = (node: VocabNode, level: number) => {
    const existingNode = this.nestedNodeMap.get(node);
    const flatNode = existingNode && existingNode.label === node.label ?
      existingNode :
      new VocabFlatNode();
    flatNode.label = node.label || '';
    flatNode.notation = node.notation;
    flatNode.level = level;
    flatNode.id = node.id;
    flatNode.description = node.description;
    flatNode.expandable = !!node.children?.length;
    this.flatNodeMap.set(flatNode, node);
    this.nestedNodeMap.set(node, flatNode);
    return flatNode;
  };

  // search filter logic start
  filterLeafNode(node: VocabFlatNode): boolean {
    if (!this.searchString) {
      return false;
    }
    if (node.notation.length !== 0) {
      return node.notation.toLowerCase()
        .indexOf(this.searchString?.toLowerCase()) === -1;
    }
    return node.label.toLowerCase()
      .indexOf(this.searchString?.toLowerCase()) === -1;
  }

  filterParentNode(node: VocabFlatNode): boolean {
    if (
      !this.searchString ||
        node.label.toLowerCase().indexOf(this.searchString?.toLowerCase()) !==
        -1
    ) {
      return false;
    }
    const descendants = this.treeControl.getDescendants(node);

    return !descendants.some(
      descendantNode => descendantNode.label
        .toLowerCase()
        .indexOf(this.searchString?.toLowerCase()) !== -1
    );
  }

  // search filter logic end

  /** Whether all the descendants of the node are selected. */
  descendantsAllSelected(node: VocabFlatNode): boolean {
    const descendants = this.treeControl.getDescendants(node);
    return descendants.length > 0 &&
        descendants.every(child => this.checklistSelection.isSelected(child));
  }

  /** Whether part of the descendants are selected */
  descendantsPartiallySelected(node: VocabFlatNode): boolean {
    const descendants = this.treeControl.getDescendants(node);
    const result = descendants.some(child => this.checklistSelection.isSelected(child));
    return result && !this.descendantsAllSelected(node);
  }

  /** Identify all nodes to be returned for display */

  getSelectedNodesList() {
    const nodesList:Set<VocabFlatNode> = new Set();
    this.checklistSelection.selected.forEach(selected => {
      const parent = this.getParentNode(selected);
      if (parent && this.checklistSelection.isSelected(parent)) {
        const lastSelectedParentNode = this.getLastParentSelected(selected);
        if (lastSelectedParentNode) { nodesList.add(lastSelectedParentNode); }
      } else {
        nodesList.add(selected);
      }
    });
    return [...nodesList];
  }

  /** Toggle the vocab entry selection. Select/deselect all the descendants node */
  VocabNodeSelectionToggle(node: VocabFlatNode): void {
    if (!this.checklistSelection.isSelected(node)) {
      if (this.getSelectedNodesList() && !this.dialogData.props.allowMultipleValues) {
        this.checklistSelection.clear();
      }
    }
    this.checklistSelection.toggle(node);
    const descendants = this.treeControl.getDescendants(node);
    if (this.checklistSelection.isSelected(node)) {
      this.checklistSelection.select(...descendants);
    } else {
      this.checklistSelection.deselect(...descendants);
    }
    // Force update for the parent
    this.checkAllParentsSelection(node);
  }

  /** Toggle a leaf vocab entry selection. Check all the parents to see if they changed */
  VocabLeafSelectionToggle(node: VocabFlatNode): void {
    if (!this.checklistSelection.isSelected(node)) {
      if (this.getSelectedNodesList() && this.dialogData.props.allowMultipleValues) {
        this.checklistSelection.toggle(node);
        if (this.checklistSelection.selected.length > 1) this.checkAllParentsSelection(node);
      } else {
        this.checklistSelection.clear();
        this.checklistSelection.toggle(node);
        if (this.checklistSelection.selected.length > 1) this.checkAllParentsSelection(node);
      }
    } else {
      if (!this.dialogData.props.allowMultipleValues) this.checklistSelection.clear();
      const parent = this.getParentNode(node);
      if (parent) {
        if (this.checklistSelection.isSelected(parent)) {
          this.checklistSelection.toggle(node);
          this.checkAllParentsSelection(node);
        } else {
          this.checklistSelection.toggle(node);
        }
      } else {
        this.checklistSelection.toggle(node);
        this.checkAllParentsSelection(node);
      }
    }
  }

  /** Checks all the parents when a leaf node is selected/unselected */
  checkAllParentsSelection(node: VocabFlatNode): void {
    let parent: VocabFlatNode | null = this.getParentNode(node);
    while (parent) {
      this.checkRootNodeSelection(parent);
      parent = this.getParentNode(parent);
    }
  }

  /** Check all the parents for last parent selected */
  getLastParentSelected(node: VocabFlatNode): VocabFlatNode | null {
    let parent: VocabFlatNode | null = this.getParentNode(node);
    let lastParent!: VocabFlatNode;
    while (this.checklistSelection.isSelected(<VocabFlatNode>parent)) {
      if (parent) {
        lastParent = parent;
        parent = this.getParentNode(parent);
      }
    }
    this.nodesList.push(lastParent);
    return lastParent;
  }

  /** Check root node checked state and change it accordingly */
  checkRootNodeSelection(node: VocabFlatNode): void {
    const nodeSelected = this.checklistSelection.isSelected(node);
    const descendants = this.treeControl.getDescendants(node);
    const descAllSelected = descendants.length > 0 &&
        descendants.every(child => this.checklistSelection.isSelected(child));
    if (nodeSelected && !descAllSelected) {
      this.checklistSelection.deselect(node);
    } else if (!nodeSelected && descAllSelected) {
      this.checklistSelection.select(node);
    }
  }

  /** Get the parent node of a node */
  getParentNode(node: VocabFlatNode): VocabFlatNode | null {
    const currentLevel = this.getLevel(node);
    if (currentLevel < 1) {
      return null;
    }
    const startIndex = this.treeControl.dataNodes.indexOf(node) - 1;
    for (let i = startIndex; i >= 0; i--) {
      const currentNode = this.treeControl.dataNodes[i];
      if (this.getLevel(currentNode) < currentLevel) {
        return currentNode;
      }
    }
    return null;
  }
}
