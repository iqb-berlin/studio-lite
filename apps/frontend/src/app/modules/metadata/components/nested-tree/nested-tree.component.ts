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

  private selectNodeChildren(checkedNode: { state:boolean | undefined, node:NotationNode }) {
    checkedNode.node.children?.forEach(child => {
      checkedNode.state ? child.selected = true : child.selected = false;
      this.selectNodeChildren({ state: child.selected, node: child });
    });
  }

  private selectNodeAncestors(node:NotationNode) {
    if (node.parent) {}
  }

  selectionChange(checkedNode: { state:boolean, node:NotationNode }) {
    if (checkedNode.node.children?.length) {
      this.nodesSelected.push({ ...checkedNode.node, selected: checkedNode.state });
      this.selectNodeChildren(checkedNode);
    } else if (checkedNode.state) {
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
        const foundNode = this.data.value.find((node:NotationNode) => node.id === topConcept.id);
        if (foundNode) {
          if (this.data.props.allowMultipleValues || this.totalSelected < 1) {
            this.nodesSelected.push(foundNode);
            this.selectNodeChildren({ state: true, node: foundNode });
            isSelected = true;
            description = foundNode?.description || '';
            this.totalSelected += 1;
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
      const foundNode = value.find((nodeValue:NotationNode) => nodeValue.id === node.id);
      if (foundNode) {
        if ((this.data.props.allowMultipleValues && nodesSelected.length >= 1) || this.totalSelected < 1) {
          this.nodesSelected.push(foundNode);
          this.selectNodeChildren({ state: foundNode.selected, node: foundNode });
          isSelected = true;
          description = foundNode?.description || '';
          this.totalSelected += 1;
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
