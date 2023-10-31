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
  vocabFetched = true;
  spinnerOn: boolean = false;
  treeDepth:number = 0;
  totalSelected = 0;
  nodesSelected : SelectedNode[] = [];
  treeControl = new NestedTreeControl<NotationNode>(node => node.children);
  dataSource = new MatTreeNestedDataSource<NotationNode>();
  async ngOnInit() {
    const vocab = await this.fetchVocab(this.data.props.url);
    this.showTree(vocab);
  }

  selectionChange(checked:{ state: boolean; node: SelectedNode; }) {
    if (checked.state) {
      this.nodesSelected.push(checked.node);
      this.totalSelected += 1;
    } else {
      this.nodesSelected = this.nodesSelected.filter(node => node.id !== checked.node.id);
      this.totalSelected -= 1;
    }
  }

  descriptionChange(el:{ description: string; node: SelectedNode; }) {
    const foundNode = this.nodesSelected.findIndex(node => node.id === el.node.id);
    this.nodesSelected[foundNode] = el.node;
  }

  async fetchVocab(url:string) : Promise<any> {
    this.spinnerOn = true;
    const response = await fetch(`${url}index.json`);
    if (response.ok) {
      this.vocabFetched = true;
      this.vocabFetched = true; const vocab = await response.json();
      this.spinnerOn = false;
      return { data: vocab };
    }
    this.spinnerOn = false;
    this.vocabFetched = false;
    return { data: {} };
  }

  showTree(vocab:any) {
    this.dataSource.data = vocab.data.hasTopConcept?.map(
      (topConcept: TopConcept) => {
        let description = '';
        let isSelected = false;
        const foundElement = this.data.value.find((val:SelectedNode) => val.id === topConcept.id);
        if (foundElement) {
          if (this.data.props.allowMultipleValues) {
            this.nodesSelected.push({
              id: foundElement.id,
              notation: foundElement.notation,
              description: foundElement.description,
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
              description: foundElement.description,
              label: foundElement.label || foundElement.name
            });
          }
        }
        return (
          {
            id: topConcept.id,
            name: `${(topConcept.notation && topConcept?.notation[0]) ?
              topConcept?.notation[0] : ''} - ${topConcept.prefLabel.de}`,
            label: topConcept.prefLabel.de,
            notation: topConcept.notation && topConcept?.notation[0] ? topConcept?.notation[0] : '',
            selected: isSelected,
            description: description,
            children: topConcept.narrower && topConcept.narrower.length ? this.mapNarrower(
              topConcept.narrower, this.data.value, this.treeDepth, this.data.props, this.nodesSelected
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
      const foundElement = nodesSelected.find((val:SelectedNode) => val.id === node.id);
      if (foundElement) {
        if (this.data.props.allowMultipleValues) {
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
        name: `${node.notation[0]} - ${node.prefLabel?.de}`,
        selected: isSelected,
        notation: node.notation[0],
        label: node.prefLabel?.de,
        children: node.narrower && (depth < props.maxLevel) ?
          this.mapNarrower(node.narrower, value, depth, props, nodesSelected) : []
      });
    }
    );
  }

  // TODO: Replace with Pipe
  // eslint-disable-next-line class-methods-use-this
  hasChild = (_: number, node: NotationNode) => !!node.children && node.children.length > 0;
}
