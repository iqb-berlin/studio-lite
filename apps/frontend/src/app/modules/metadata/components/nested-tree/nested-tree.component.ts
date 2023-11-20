import { NestedTreeControl } from '@angular/cdk/tree';
import {
  Component, OnInit, Inject, Input
} from '@angular/core';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
  DialogData, NestedTreeParameters, NotationNode, SelectedNode
} from '../../models/types';

type TopConcept = {
  notation: string[];
  prefLabel: { de:string };
  narrower: NotationNode[];
  id:string
};

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
  nodesSelected : SelectedNode[] = [];
  treeControl = new NestedTreeControl<NotationNode>(node => node.children);
  dataSource = new MatTreeNestedDataSource<NotationNode>();
  vocabularyTitle = '';
  async ngOnInit() {
    const vocabulary = this.data.vocabularies.find((vocab:any) => vocab.url === this.data.props.url);
    this.getTreeDepth(vocabulary.data);
    this.vocabularyTitle = vocabulary.data.title.de || '';
    this.showTree(vocabulary.data);
  }

  selectionChange(checkedNode: { state:boolean, node:SelectedNode, expandable:boolean }) {
    if (checkedNode.expandable) {
      // eslint-disable-next-line no-restricted-syntax
      for (const child of checkedNode.node.children || []) {
        checkedNode.state ? child.selected = true : child.selected = false;
        checkedNode.node.indeterminate = true;
        this.nodesSelected.map(obj => {
          const found = this.nodesSelected.find(o => o.id === checkedNode.node.id) || obj;
          return { ...found, indeterminate: true };
        });
        // const parent = this.nodesSelected.filter((node:SelectedNode) => node.id === checkedNode.node.id);

        this.nodesSelected.push({
          id: child.id,
          notation: child.notation,
          label: child.label || '',
          description: child.description,
          children: child.children
        });
        if (child.children) {
          // eslint-disable-next-line no-restricted-syntax
          for (const childChild of child.children || []) {
            this.nodesSelected.push({
              id: child.id,
              notation: child.notation,
              label: child.label || '',
              description: child.description,
              children: child.children
            });
            childChild.selected = !childChild.selected;
          }
        }
      }
    }

    if (checkedNode.state) {
      this.nodesSelected.push(checkedNode.node);
      this.totalSelected += 1;
    } else {
      this.nodesSelected = this.nodesSelected.filter(node => node.id !== checkedNode.node.id);
      this.totalSelected -= 1;
    }
  }

  descriptionChange(el:{ description: string; node: SelectedNode; }) {
    const foundNode = this.nodesSelected.findIndex(node => node.id === el.node.id);
    this.nodesSelected[foundNode] = el.node;
  }

  getTreeDepth(vocab:any) {
    let treeDepth = 0;
    function hasNarrower(data:any) {
      treeDepth += 1;
      if (data.narrower) {
        return hasNarrower(data.narrower[0]);
      } return {};
    }
    hasNarrower(vocab.hasTopConcept[0]);
    this.treeDepth = treeDepth;
  }

  showTree(vocab:any) {
    this.dataSource.data = vocab.hasTopConcept?.map(
      (topConcept: TopConcept) => {
        let description = '';
        let isSelected = false;
        const foundElement = this.data.value.find((val:SelectedNode) => val.id === topConcept.id);
        if (foundElement) {
          if (this.data.props.allowMultipleValues) {
            this.nodesSelected.push({
              id: foundElement.id,
              notation: foundElement.notation,
              description: foundElement.text,
              label: foundElement.label || foundElement.name
            });
            isSelected = true;
            description = foundElement?.description;
            this.totalSelected += 1;
          } else if (this.totalSelected < 1) {
            isSelected = true;
            description = foundElement?.description;
            this.totalSelected += 1;
            this.nodesSelected.push({
              id: foundElement.id,
              notation: foundElement.notation,
              description: foundElement.text,
              label: foundElement.label || foundElement.name
            });
          }
        }
        return (
          {
            id: topConcept.id,
            name: `${(topConcept.notation && topConcept?.notation[0]) ?
              topConcept?.notation[0] : ''}   ${topConcept.prefLabel.de}`,
            label: topConcept.prefLabel.de,
            notation: topConcept.notation && topConcept?.notation[0] ? topConcept?.notation[0] : '',
            selected: isSelected,
            description: description,
            level: this.currentTreeDepth,
            children: topConcept.narrower && topConcept.narrower.length &&
            (this.treeDepth < this.data.props.maxLevel || this.data.props.maxLevel === 0) ? this.mapNarrower(
                topConcept.narrower, this.data.value, this.currentTreeDepth, this.data.props, this.nodesSelected
              ) : []
          }
        );
      });
  }

  mapNarrower(
    nodes: NotationNode[],
    value: SelectedNode[],
    treeDepth:number,
    props:NestedTreeParameters,
    nodesSelected:Array<SelectedNode>
  ) :NotationNode[] {
    const depth = treeDepth + 1;
    return nodes.map((node: NotationNode) => {
      let description = '';
      let isSelected = false;
      const foundElement = value.find((val:SelectedNode) => val.id === node.id);
      if (foundElement) {
        if (this.data.props.allowMultipleValues && nodesSelected.length >= 1) {
          this.nodesSelected.push({
            id: foundElement.id,
            notation: foundElement.notation,
            description: foundElement.description,
            label: foundElement.label
          });
          isSelected = true;
          description = foundElement?.description;
          this.totalSelected += 1;
        } else if (this.totalSelected < 1) {
          isSelected = true;
          description = foundElement?.description;
          this.totalSelected += 1;
          this.nodesSelected.push({
            id: foundElement.id,
            notation: foundElement.notation,
            description: foundElement.description,
            label: foundElement.label
          });
        }
      }
      return ({
        id: node.id,
        description: description,
        name: `${node.notation[0]} ${node.prefLabel?.de}`,
        selected: isSelected,
        notation: node.notation[0],
        level: depth,
        label: `${node.prefLabel?.de}`,
        children: node.narrower && (depth < this.data.props.maxLevel || this.data.props.maxLevel === 0) ?
          this.mapNarrower(node.narrower, value, depth, props, nodesSelected) : []
      });
    }
    );
  }

  // TODO: Replace with Pipe
  // eslint-disable-next-line class-methods-use-this
  hasChild = (_: number, node: NotationNode) => !!node.children && node.children.length > 0;
}
