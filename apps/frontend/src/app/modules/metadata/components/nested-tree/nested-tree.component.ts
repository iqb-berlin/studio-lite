import { NestedTreeControl } from '@angular/cdk/tree';
import {
  Component, Input, OnInit, Inject
} from '@angular/core';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

interface NotationNode {
  name: string;
  children?: NotationNode[];
  url?:string;
  prefLabel?:string;
  selected?:boolean;
}

@Component({
  selector: 'studio-lite-nested-tree',
  templateUrl: './nested-tree.component.html',
  styleUrls: ['./nested-tree.component.scss']

})
export class NestedTreeComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  @Input() treeDepth!:number;
  values:Array<string> = [];
  treeControl = new NestedTreeControl<NotationNode>(node => node.children);
  dataSource = new MatTreeNestedDataSource<NotationNode>();
  ngOnInit() {
    const JSONData = JSON.parse(JSON.stringify(this.data[0]));
    const mappedData = JSONData.hasTopConcept.map(
      (topConcept: { notation: string[]; prefLabel: any; narrower: any[]; }
      ) => (
        {
          name: `${topConcept.notation[0]} - ${topConcept.prefLabel.de}`,
          notation: topConcept.notation[0],
          description: '',
          children: topConcept.narrower.length !== 0 ? mapNarrower(topConcept.narrower, this.data[1]) : []
        }
      ));
    function mapNarrower(arr: any[], value: any) :any {
      return arr.map(((arrElement: any) => {
        const isSelected = !!value.find((val: any) => val.name === arrElement.notation[0]);
        return ({
          name: `${arrElement.notation[0]} - ${arrElement.prefLabel.de}`,
          description: '',
          selected: isSelected,
          notation: arrElement.notation[0],
          children: arrElement.narrower ? mapNarrower(arrElement.narrower, value) : []
        });
      }

      ));
    }
    this.dataSource.data = mappedData;
  }

  // TODO: Replace with Pipe
  hasChild = (_: number, node: NotationNode) => !!node.children && node.children.length > 0;
}
