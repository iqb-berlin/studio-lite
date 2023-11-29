// eslint-disable-next-line max-classes-per-file
import { SelectionModel } from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import {
  Component, Inject, Injectable, OnInit
} from '@angular/core';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { BehaviorSubject } from 'rxjs';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
  DialogData, VocabFlatNode, VocabNode, Vocabulary
} from '../../models/types';

@Injectable()
export class ChecklistDatabase {
  dataChange = new BehaviorSubject<VocabNode[]>([]);

  get data(): VocabNode[] {
    return this.dataChange.value;
  }

  constructor(@Inject(MAT_DIALOG_DATA) public dialogData: DialogData) {
    this.initialize();
  }

  makeTree(vocab: Vocabulary) {
    return vocab.hasTopConcept?.map(
      (topConcept: any) => {
        const foundNode = new VocabNode();

        this.dialogData.value.forEach((v: any) => {
          if (v.id === topConcept.id) {
            foundNode.id = v.id;
            foundNode.label = v.name.substring(v.name.indexOf(' ') + 1);
            foundNode.notation = v.notation || '';
            foundNode.description = v.description || '';
            foundNode.children = topConcept.narrower && topConcept.narrower.length ? this.mapNarrower(
              topConcept.narrower
            ) : [];
          }
        });

        if (Object.keys(foundNode).length !== 0) {
          return foundNode;
        }

        const node = new VocabNode();
        node.id = topConcept.id;
        node.label = topConcept.prefLabel?.de;
        node.notation = topConcept.notation || '';
        node.description = topConcept.description || '';
        node.children = topConcept.narrower && topConcept.narrower.length ? this.mapNarrower(
          topConcept.narrower
        ) : [];
        return node;
      }
    );
  }

  mapNarrower(
    nodes: VocabFlatNode[]
  ) {
    return nodes?.map((n: any) => {
      const foundNode = new VocabNode();

      this.dialogData.value.forEach((v: any) => {
        if (v.id === n.id) {
          foundNode.id = v.id;
          foundNode.label = v.name.substring(v.name.indexOf(' ') + 1);
          foundNode.notation = v.notation || '';
          foundNode.description = v.description || '';
          foundNode.children = n.narrower && n.narrower.length ? this.mapNarrower(
            n.narrower
          ) : [];
        }
      });
      if (Object.keys(foundNode).length !== 0) {
        return foundNode;
      }
      const node = new VocabNode();
      node.id = n.id;
      node.label = n.prefLabel?.de;
      node.notation = n.notation || '';
      node.description = n.description || '';
      node.children = n.narrower ? this.mapNarrower(n.narrower) : [];
      return node;
    }
    );
  }

  initialize() {
    const vocabulary = this.dialogData.vocabularies
      ?.find((vocab: { url: string, data: Vocabulary }) => vocab.url === this.dialogData.props.url);
    if (vocabulary && vocabulary.data) {
      const tree = this.makeTree(vocabulary.data);
      this.dataChange.next(tree);
    }
  }
}

@Component({
  selector: 'studio-lite-new-nested-tree',
  templateUrl: './new-nested-tree.component.html',
  styleUrls: ['./new-nested-tree.component.scss'],
  providers: [ChecklistDatabase]

})

export class NewNestedTreeComponent implements OnInit {
  /** Map from flat node to nested node. This helps us finding the nested node to be modified */
  flatNodeMap = new Map<VocabFlatNode, VocabNode>();

  searchString = '';
  /** Map from nested node to flattened node. This helps us to keep the same object for selection */
  nestedNodeMap = new Map<VocabNode, VocabFlatNode>();

  /** A selected parent node to be inserted */
  selectedParent: VocabFlatNode | null = null;

  /** The new item's name */
  newItemName = '';

  treeControl: FlatTreeControl<VocabFlatNode>;

  treeFlattener: MatTreeFlattener<VocabNode, VocabFlatNode>;

  dataSource: MatTreeFlatDataSource<VocabNode, VocabFlatNode>;

  vocabularyTitle = '';

  /** The selection for checklist */
  checklistSelection = new SelectionModel<VocabFlatNode>(true /* multiple */);

  constructor(private _database: ChecklistDatabase, @Inject(MAT_DIALOG_DATA) public dialogData: DialogData) {
    this.treeFlattener = new MatTreeFlattener(this.transformer, this.getLevel, this.isExpandable, this.getChildren);
    this.treeControl = new FlatTreeControl<VocabFlatNode>(this.getLevel, this.isExpandable);
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

    _database.dataChange.subscribe(data => {
      this.dataSource.data = data;

      this.treeControl.expand(this.treeControl.dataNodes[0]);
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
        this.searchNodeInTree(v);
      });
    }
  }

  searchNodeInTree(targetNode: VocabFlatNode) {
    this.dialogData.value.forEach(value => {
      this.checklistSelection.toggle(value);
    });

  /*  ?.forEach(node => {
      if (node?.id === targetNode?.id) {
        const nodeInMap = this.nestedNodeMap.get(node);
        if (nodeInMap && Object.keys(nodeInMap).length === 0) {
          this.VocabNodeSelectionToggle(nodeInMap);
        }
      }
      if (node.children.length !== 0) {
        node.children.forEach(child => {
          if (child?.id === targetNode?.id) {
            const nodeInMap = this.nestedNodeMap.get(child);
            if (nodeInMap) {
              this.VocabNodeSelectionToggle(nodeInMap);
            }
          }
          if (child.children.length > 0) this.searchNodeInTree(child.children, targetNode);
        });
      }
    }); */
  }

  nodesList: VocabFlatNode[] = [];

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
    flatNode.label = node.label;
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

  closeDialog() {
    const nodesList:Set<VocabFlatNode> = new Set();
    this.checklistSelection.selected.forEach(selected => {
      const parent = this.getParentNode(selected);
      if (parent && (this.getLastParentSelected(selected) === parent)) {
        nodesList.add(parent);
      } else {
        nodesList.add(selected);
      }
      const node = this.flatNodeMap.get(selected);
      if (node && node.children) {
      //  node.children.some(child => this.checklistSelection.isSelected(child));
      }
    });
    return [...nodesList];
  }

  /** Toggle the vocab entry selection. Select/deselect all the descendants node */
  VocabNodeSelectionToggle(node: VocabFlatNode): void {
    if (!this.checklistSelection.isSelected(node)) {
      this.nodesList.push(node);
      this.treeControl.getDescendants(node);
    } else {
      this.nodesList = this.nodesList.filter(n => n.id !== node.id);
    }
    this.checklistSelection.toggle(node);
    const descendants = this.treeControl.getDescendants(node);
    this.checklistSelection.isSelected(node) ?
      this.checklistSelection.select(...descendants) :
      this.checklistSelection.deselect(...descendants);

    // Force update for the parent
    descendants.forEach(child => this.checklistSelection.isSelected(child));
    this.checkAllParentsSelection(node);
  }

  /** Toggle a leaf vocab entry selection. Check all the parents to see if they changed */
  VocabLeafSelectionToggle(node: VocabFlatNode): void {
    if (!this.checklistSelection.isSelected(node)) this.nodesList.push(node);
    else {
      this.nodesList = this.nodesList.filter(n => n.id !== node.id);
    }
    this.checklistSelection.toggle(node);
    this.checkAllParentsSelection(node);
  }

  /* Checks all the parents when a leaf node is selected/unselected */
  checkAllParentsSelection(node: VocabFlatNode): void {
    let parent: VocabFlatNode | null = this.getParentNode(node);
    while (parent) {
      this.checkRootNodeSelection(parent);
      parent = this.getParentNode(parent);
    }
  }

  getLastParentSelected(node: VocabFlatNode): VocabFlatNode | null {
    let parent: VocabFlatNode | null = this.getParentNode(node);
    let lastParent!: VocabFlatNode;
    while (parent) {
      lastParent = parent;
      this.checkRootNodeSelection(parent);
      parent = this.getParentNode(parent);
    }
    const nodeSelected = this.checklistSelection.isSelected(lastParent);
    if (nodeSelected) {
      this.nodesList.push(lastParent);
      return lastParent;
    }
    return null;
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

  /* Get the parent node of a node */
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
