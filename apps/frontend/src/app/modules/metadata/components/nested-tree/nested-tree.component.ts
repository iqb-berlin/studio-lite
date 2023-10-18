import { NestedTreeControl } from '@angular/cdk/tree';
import {
  Component, OnInit, Inject, Input
} from '@angular/core';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
  DialogData, NestedTreeParameters, NotationNode, SelectedNode
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
  treeDepth:number = 0;
  selectedNodes = this.data.selectedNodes;
  treeControl = new NestedTreeControl<NotationNode>(node => node.children);
  dataSource = new MatTreeNestedDataSource<NotationNode>();
  ngOnInit() {
    const jsonString = JSON.stringify(this.data.vocab);
    if (typeof jsonString !== 'undefined') {
      const jsonObj = JSON.parse(jsonString);
      this.dataSource.data = jsonObj.hasTopConcept.map(
        (topConcept: { notation: string[]; prefLabel: { de:string }; narrower: NotationNode[]; id:string }
        ) => (
          {
            id: topConcept.id,
            name: `${topConcept.notation[0]} - ${topConcept.prefLabel.de}`,
            notation: topConcept.notation[0],
            description: '',
            children: topConcept.narrower.length !== 0 ? mapNarrower(
              topConcept.narrower, this.data.value, this.treeDepth, this.data.params.maxLevel, this.selectedNodes
            ) : []
          }
        ));
    }
    function mapNarrower(
      nodes: NotationNode[],
      value: { name:string },
      treeDepth:number,
      maxLevel:number,
      selectedNodes:Array<SelectedNode>) :NotationNode[] {
      const depth = treeDepth + 1;
      return nodes.map(((arrElement: NotationNode): NotationNode => {
        let description = '';
        let isSelected = false;
        const filteredResult = selectedNodes.find((val:SelectedNode) => val.id === arrElement.id);
        if (filteredResult) {
          isSelected = true;
          description = filteredResult?.description;
        }
        return ({
          id: arrElement.id,
          description: description,
          name: `${arrElement.notation[0]} - ${arrElement.prefLabel?.de}`,
          selected: isSelected,
          notation: arrElement.notation[0],
          label: arrElement.prefLabel?.de,
          children: arrElement.narrower && (depth < maxLevel) ?
            mapNarrower(arrElement.narrower, value, depth, maxLevel, selectedNodes) : []
        });
      }

      ));
    }
  }

  // TODO: Replace with Pipe
  // eslint-disable-next-line class-methods-use-this
  hasChild = (_: number, node: NotationNode) => !!node.children && node.children.length > 0;
}
