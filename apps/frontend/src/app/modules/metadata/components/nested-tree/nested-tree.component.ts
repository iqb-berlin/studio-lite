import { NestedTreeControl } from '@angular/cdk/tree';
import {
  Component, OnInit, Inject, Input
} from '@angular/core';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
  DialogData, NestedTreeParameters, NotationNode, Vocabulary
} from '../../models/types';

@Component({
  selector: 'studio-lite-nested-tree',
  templateUrl: './nested-tree.component.html',
  styleUrls: ['./nested-tree.component.scss']

})
export class NestedTreeComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) { }

  @Input() treeParameters!:NestedTreeParameters;
  treeDepth:number = 1;
  currentTreeDepth:number = 0;
  totalSelected = 0;
  nodesSelected : NotationNode[] = [];
  treeControl = new NestedTreeControl<NotationNode>(node => node.children);
  dataSource = new MatTreeNestedDataSource<NotationNode>();
  vocabularyTitle = '';
  async ngOnInit() {
    const vocabulary = this.data.vocabularies
      ?.find((vocab: { url:string, data:Vocabulary }) => vocab.url === this.data.props.url);
    if (vocabulary && vocabulary.data) {
      this.getTreeDepth(vocabulary.data);
      this.vocabularyTitle = vocabulary.data.title.de || '';
      this.showTree(vocabulary.data);
    }
  }

  selectionChange(checkedNode: { state:boolean, node:NotationNode }) {
    const parent = checkedNode.node.parent;
    if (checkedNode.node.children?.length) {
      // eslint-disable-next-line no-restricted-syntax
      for (const child of checkedNode.node.children || []) {
        checkedNode.state ? child.selected = true : child.selected = false;
        // checkedNode.node.indeterminate = true;
        // this.treeControl.expand(child);
        this.nodesSelected = this.nodesSelected.map(obj => {
          const found = this.nodesSelected?.find(o => o.id === checkedNode.node.id) || obj;
          if (found) {
            return { ...found, indeterminate: true };
          }
          return obj;
        });
        this.nodesSelected.push(child);
        if (child.children) {
          // eslint-disable-next-line no-restricted-syntax
          for (const childChild of child.children || []) {
            this.nodesSelected.push(child);
            childChild.selected = !childChild.selected;
          }
        }
      }
    }
    if (checkedNode.state) {
      const found = this.nodesSelected?.find(node => node.id === checkedNode.node.parent?.id);
      if (found && found.children) {
        let countSelectedChildren = 0;
        // eslint-disable-next-line no-restricted-syntax
        for (const child of found.children) {
          if (child.selected) countSelectedChildren += 1;
        }
        if (countSelectedChildren < found.children.length) {
          found.indeterminate = true;
        }
      }
      this.nodesSelected.push(checkedNode.node);
      this.totalSelected += 1;
    } else {
      this.nodesSelected = this.nodesSelected.filter(node => node.id !== checkedNode.node.id);
      this.totalSelected -= 1;
    }
  }

  descriptionChange(el:{ description: string; node: NotationNode; }) {
    const foundNode = this.nodesSelected.findIndex(node => node.id === el.node.id);
    this.nodesSelected[foundNode] = el.node;
  }

  getTreeDepth(vocab:Vocabulary) {
    let treeDepth = 0;
    function hasNarrower(data:NotationNode) {
      treeDepth += 1;
      if (data.narrower) {
        return hasNarrower(data.narrower[0]);
      } return {};
    }
    hasNarrower(vocab.hasTopConcept[0]);
    this.treeDepth = treeDepth;
  }

  showTree(vocab:Vocabulary) {
    this.dataSource.data = vocab.hasTopConcept?.map(
      (topConcept: NotationNode) => {
        let description = '';
        let isSelected = false;
        const foundNode = this.data.value.find((val:NotationNode) => val.id === topConcept.id);
        if (foundNode) {
          if (this.data.props.allowMultipleValues) {
            this.nodesSelected.push(foundNode);
            isSelected = true;
            description = foundNode?.description || '';
            this.totalSelected += 1;
          } else if (this.totalSelected < 1) {
            isSelected = true;
            description = foundNode?.description || '';
            this.totalSelected += 1;
            this.nodesSelected.push(foundNode);
          }
        }
        return (
          {
            id: topConcept.id,
            label: topConcept.prefLabel?.de,
            notation: topConcept.notation || '',
            selected: isSelected,
            description: description,
            level: this.currentTreeDepth,
            children: topConcept.narrower && topConcept.narrower.length &&
            (this.treeDepth < this.data.props.maxLevel || this.data.props.maxLevel === 0) ?
              this.mapNarrower(
                topConcept,
                topConcept.narrower,
                this.data.value,
                this.currentTreeDepth,
                this.data.props,
                this.nodesSelected
              ) : []
          }
        );
      });
  }

  mapNarrower(
    parent:NotationNode,
    nodes: NotationNode[],
    value: NotationNode[],
    treeDepth:number,
    props:NestedTreeParameters,
    nodesSelected:Array<NotationNode>
  ) :NotationNode[] {
    const depth = treeDepth + 1;
    return nodes.map((node: NotationNode) => {
      let description = '';
      let isSelected = false;
      const foundElement = value.find((val:NotationNode) => val.id === node.id);
      if (foundElement) {
        if (this.data.props.allowMultipleValues && nodesSelected.length >= 1) {
          this.nodesSelected.push(foundElement);
          isSelected = true;
          description = foundElement?.description || '';
          this.totalSelected += 1;
        } else if (this.totalSelected < 1) {
          isSelected = true;
          description = foundElement?.description || '';
          this.totalSelected += 1;
          this.nodesSelected.push(foundElement);
        }
      }
      return ({
        id: node.id,
        notation: node.notation,
        description: description,
        selected: isSelected,
        level: depth,
        label: `${node.prefLabel?.de}`,
        parent: parent,
        children: node.narrower && (depth < this.data.props.maxLevel || this.data.props.maxLevel === 0) ?
          this.mapNarrower(node, node.narrower, value, depth, props, nodesSelected) : []
      });
    }
    );
  }

  // TODO: Replace with Pipe
  // eslint-disable-next-line class-methods-use-this
  hasChild = (_: number, node: NotationNode) => !!node.children && node.children.length > 0;
}
