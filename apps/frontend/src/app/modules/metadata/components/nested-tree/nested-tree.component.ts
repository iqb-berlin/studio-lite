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
  foundNode!:NotationNode;
  async ngOnInit() {
    const vocabulary = this.data.vocabularies
      ?.find((vocab: { url:string, data:Vocabulary }) => vocab.url === this.data.props.url);
    if (vocabulary && vocabulary.data) {
      this.getTreeDepth(vocabulary.data);
      this.vocabularyTitle = vocabulary.data.title.de || '';
      this.treeControl.dataNodes = this.dataSource.data;
      this.showTree(vocabulary.data);
      // console.log(this.dataSource.data, 'this.dataSource.data');
      // this.treeControl.expandAll();
      // this.treeControl.expand(this.dataSource.data[1]);
      // this.treeControl.expandDescendants(this.dataSource.data[1]);
    }
  }

  private selectNodeChildren(checkedNode: { state:boolean | undefined, node:NotationNode }) {
    checkedNode.node.selected = checkedNode.state;
    checkedNode.node.children?.forEach(child => {
      checkedNode.state ? child.selected = true : child.selected = false;
      this.selectNodeChildren({ state: child.selected, node: child });
    });
  }

  private searchChildren(children:NotationNode[], node:NotationNode) {
    const foundNode = children.find(n => n.id === node.id);
    if (foundNode) {
      if (!this.foundNode) {
        this.foundNode = foundNode;
      }
    }
    children.forEach(child => {
      if (child.children) {
        this.searchChildren(child.children, child);
      }
    });
  }

  private findNodeInTree(node:NotationNode) {
    const foundNode = this.dataSource.data.find(n => n.id === node.id);
    if (foundNode) {
      this.foundNode = foundNode;
    }
    this.dataSource.data.forEach(d => {
      if (d.children) {
        this.searchChildren(d.children, node);
      }
    });
  }

  private indeterminateNodeAncestors(node: NotationNode | undefined) {
    if (node) {
      let countSelectedChildren = 0;
      this.findNodeInTree(node);
      this.foundNode.children?.forEach(child => {
        if (child.selected) countSelectedChildren += 1;
      });
      if (countSelectedChildren < (this.foundNode.children?.length || 0)) {
        this.indeterminateNodeAncestors(this.foundNode);
      }
      this.foundNode.selected = false;
      this.foundNode.indeterminate = true;

      if (this.foundNode.parent) {
        this.indeterminateNodeAncestors(this.foundNode.parent);
      }
    }
  }

  selectionChange(checkedNode: { state:boolean, node:NotationNode }) {
    this.findNodeInTree(checkedNode.node);
    if (checkedNode.node.children?.length) {
      if (checkedNode.state) {
        this.nodesSelected
          .push({ ...checkedNode.node, selected: checkedNode.state });
        this.totalSelected += 1;
      } else {
        this.nodesSelected = this.nodesSelected.filter(node => node.id !== checkedNode.node.id);
        this.totalSelected -= 1;
      }
      this.selectNodeChildren(checkedNode);
      this.indeterminateNodeAncestors(checkedNode.node.parent);
    } else {
      if (checkedNode.state) {
        this.nodesSelected
          .push({ ...checkedNode.node, selected: checkedNode.state });
        this.totalSelected += 1;
      } else {
        this.nodesSelected = this.nodesSelected.filter(node => node.id !== checkedNode.node.id);
        this.totalSelected -= 1;
      }
      if (checkedNode && (checkedNode.node.parent)) {
        let countSelectedChildren = 0;
        this.findNodeInTree(checkedNode.node.parent);
        this.foundNode.children?.forEach(child => {
          if (child.selected) countSelectedChildren += 1;
        });
        if (countSelectedChildren < (this.foundNode.children?.length || 0)) {
          this.indeterminateNodeAncestors(this.foundNode);
        }
      }

      checkedNode.node.selected = checkedNode.state;
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
            isSelected = true;
            description = foundNode?.description || '';
            this.totalSelected += 1;
            setTimeout(() => {
              this.findNodeInTree(foundNode);
              this.selectNodeChildren({ state: this.foundNode.selected, node: this.foundNode });
              this.indeterminateNodeAncestors(this.foundNode.parent);
            });
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
          isSelected = true;
          description = foundNode?.description || '';
          this.totalSelected += 1;
          setTimeout(() => {
            this.findNodeInTree(foundNode);
            this.selectNodeChildren({ state: this.foundNode.selected, node: this.foundNode });
            this.indeterminateNodeAncestors(this.foundNode.parent);
          });
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
