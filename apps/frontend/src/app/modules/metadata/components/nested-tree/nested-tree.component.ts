import { SelectionModel } from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, Inject, OnInit } from '@angular/core';
import {
  MatTree,
  MatTreeFlatDataSource,
  MatTreeFlattener,
  MatTreeNode,
  MatTreeNodeDef,
  MatTreeNodePadding,
  MatTreeNodeToggle
} from '@angular/material/tree';
import { Subject, takeUntil } from 'rxjs';
import {
  MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent
} from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { MatIcon } from '@angular/material/icon';

import { MatCheckbox } from '@angular/material/checkbox';
import { MatButton, MatIconButton } from '@angular/material/button';
import {
  DialogData, VocabFlatNode, VocabNode, Vocabulary
} from '../../models/vocabulary.class';
import { AreAllDescendantsSelectedPipe } from '../../pipes/are-all-descendants-selected.pipe';
import { AreSomeDescendantsSelectedPipe } from '../../pipes/are-some-descendants-selected.pipe';
import { IsTreeControlExpandedPipe } from '../../pipes/is-tree-control-expanded.pipe';
import { IsNodeSelectedPipe } from '../../pipes/is-node-selected.pipe';
import { VocabNodeChangeService } from '../../services/vocab-node-change.service';

@Component({
    selector: 'studio-lite-nested-tree',
    templateUrl: './nested-tree.component.html',
    styleUrls: ['./nested-tree.component.scss'],
    providers: [VocabNodeChangeService],
    // eslint-disable-next-line max-len
    imports: [MatDialogContent, MatTree, MatTreeNodeDef, MatTreeNode, MatTreeNodeToggle, MatTreeNodePadding, MatIconButton, MatCheckbox, MatIcon, MatDialogActions, MatButton, MatDialogClose, TranslateModule, AreAllDescendantsSelectedPipe, AreSomeDescendantsSelectedPipe, IsTreeControlExpandedPipe, IsNodeSelectedPipe]
})

export class NestedTreeComponent implements OnInit {
  /** Map from flat node to nested node. This helps us find the nested node to be modified */
  private flatNodeMap = new Map<VocabFlatNode, VocabNode>();

  /** Map from nested node to flattened node. This helps us to keep the same object for selection */
  private nestedNodeMap = new Map<VocabNode, VocabFlatNode>();

  treeControl: FlatTreeControl<VocabFlatNode>;
  treeFlattener: MatTreeFlattener<VocabNode, VocabFlatNode>;
  dataSource: MatTreeFlatDataSource<VocabNode, VocabFlatNode>;
  vocabularyTitle = '';
  nodesList: VocabFlatNode[] = [];
  checklistSelection = new SelectionModel<VocabFlatNode>(true /* multiple */);
  private ngUnsubscribe = new Subject<void>();
  pipeTransformTrigger: boolean = false;
  selectedNodesList: VocabFlatNode[] = [];

  constructor(private _database: VocabNodeChangeService, @Inject(MAT_DIALOG_DATA) public dialogData: DialogData) {
    this.treeFlattener = new MatTreeFlattener(this.transformer, this.getLevel, this.isExpandable, this.getChildren);
    this.treeControl = new FlatTreeControl<VocabFlatNode>(this.getLevel, this.isExpandable);
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
    this._database.dataChange
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(data => {
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
      this.dialogData.value.forEach(v => {
        this.treeControl.dataNodes.forEach(node => {
          if (node.id === v.id) {
            this.vocabNodeSelectionToggle(node);
          }
        });
      });
    }
  }

  // eslint-disable-next-line class-methods-use-this
  private getLevel = (node: VocabFlatNode) => node.level;

  // eslint-disable-next-line class-methods-use-this
  private isExpandable = (node: VocabFlatNode) => node.expandable;

  // eslint-disable-next-line class-methods-use-this
  private getChildren = (node: VocabNode): VocabNode[] => node.children;

  // eslint-disable-next-line class-methods-use-this
  hasChild = (_: number, _nodeData: VocabFlatNode) => _nodeData.expandable;

  /**
   * Transformer to convert nested node to flat node. Record the nodes in maps for later use.
   */
  private transformer = (node: VocabNode, level: number) => {
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

  getSelectedNodesList(): VocabFlatNode[] {
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
  vocabNodeSelectionToggle(node: VocabFlatNode): void {
    this.pipeTransformTrigger = !this.pipeTransformTrigger;
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
    this.selectedNodesList = this.getSelectedNodesList();
  }

  /** Toggle a leaf vocab entry selection. Check all the parents to see if they changed */
  vocabLeafSelectionToggle(node: VocabFlatNode): void {
    this.pipeTransformTrigger = !this.pipeTransformTrigger;
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
    this.selectedNodesList = this.getSelectedNodesList();
  }

  /** Checks all the parents when a leaf node is selected/unselected */
  private checkAllParentsSelection(node: VocabFlatNode): void {
    let parent: VocabFlatNode | null = this.getParentNode(node);
    while (parent) {
      this.checkRootNodeSelection(parent);
      parent = this.getParentNode(parent);
    }
  }

  /** Check all the parents for last parent selected */
  private getLastParentSelected(node: VocabFlatNode): VocabFlatNode | null {
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
  private checkRootNodeSelection(node: VocabFlatNode): void {
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
  private getParentNode(node: VocabFlatNode): VocabFlatNode | null {
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

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
