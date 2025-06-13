import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
  DialogData, NotationNode, VocabNode, Vocabulary
} from '../models/vocabulary.class';

@Injectable()
export class VocabNodeChangeService {
  dataChange = new BehaviorSubject<VocabNode[]>([]);
  private treeDepth: number = 1;

  get data(): VocabNode[] {
    return this.dataChange.value;
  }

  constructor(@Inject(MAT_DIALOG_DATA) private dialogData: DialogData) {
    this.initialize();
  }

  private getTreeDepth(treeNodes: NotationNode[]): number {
    const lengths = treeNodes.map(node => {
      if (node.narrower === undefined) {
        return 1;
      }
      return this.getTreeDepth(node.narrower) + 1;
    });
    return Math.max(...lengths);
  }

  createTreeNodes(depth: number, notationNode: NotationNode, mapNarrowerDepth: number): VocabNode {
    const foundNode = new VocabNode();
    this.dialogData.value.forEach(v => {
      if (v.id === notationNode.id) {
        foundNode.id = v.id;
        foundNode.label = v.name.substring(v.name.indexOf(' ') + 1) || '';
        foundNode.notation = v.notation || [];
        foundNode.description = v.description || '';
        foundNode.children = notationNode.narrower && notationNode.narrower.length &&
        (depth < this.dialogData.props.maxLevel || this.dialogData.props.maxLevel === 0) ?
          this.mapNarrower(notationNode.narrower, mapNarrowerDepth) : [];
      }
    });
    if (Object.keys(foundNode).length !== 0) {
      return foundNode;
    }
    const node = new VocabNode();
    node.id = notationNode.id;
    node.label = notationNode.prefLabel?.de || '';
    node.notation = notationNode.notation || [];
    node.description = notationNode.description || '';
    node.children = notationNode.narrower &&
    (depth < this.dialogData.props.maxLevel || this.dialogData.props.maxLevel === 0) ?
      this.mapNarrower(notationNode.narrower, mapNarrowerDepth) : [];
    return node;
  }

  private makeTree(vocab: Vocabulary): VocabNode[] {
    return vocab.hasTopConcept?.map(
      notationNode => this.createTreeNodes(1, notationNode, this.treeDepth)
    );
  }

  private mapNarrower(
    nodes: NotationNode[], treeDepth: number
  ): VocabNode[] {
    const depth = treeDepth + 1;
    return nodes?.map(notationNode => this.createTreeNodes(depth, notationNode, depth)
    );
  }

  private initialize(): void {
    const vocabulary = this.dialogData.vocabularies
      ?.find((vocab: { url: string, data: Vocabulary }) => vocab.url === this.dialogData.props.url);
    if (vocabulary && vocabulary.data) {
      this.treeDepth = this.getTreeDepth(vocabulary.data.hasTopConcept);
      const tree = this.makeTree(vocabulary.data);
      this.dataChange.next(tree);
    }
  }
}
