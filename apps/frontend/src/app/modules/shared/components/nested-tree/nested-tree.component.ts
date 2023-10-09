import { NestedTreeControl } from '@angular/cdk/tree';
import { Component, OnInit } from '@angular/core';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import * as educationalStandardMPr22Inh from '../../../workspace/components/unit-metadata/educational-standards/Bildungsstandards-Mathematik-Primar-2022-Inhaltsbezogene-Kompetenzen.json';

interface NotationNode {
  name: string;
  children?: NotationNode[];
  url?:string;
  prefLabel?:string;
}

@Component({
  selector: 'studio-lite-nested-tree',
  templateUrl: './nested-tree.component.html',
  styleUrls: ['./nested-tree.component.scss']

})
export class NestedTreeComponent implements OnInit {
  treeControl = new NestedTreeControl<NotationNode>(node => node.children);
  dataSource = new MatTreeNestedDataSource<NotationNode>();
  ngOnInit() {
    const JSONdata = JSON.parse(JSON.stringify(educationalStandardMPr22Inh));
    const mappedData = JSONdata.hasTopConcept.map((topConcept: { notation: any[]; prefLabel: any; narrower: any[]; }) => (
      {
        name: `${topConcept.notation[0]} - ${topConcept.prefLabel.de}`,
        children: topConcept.narrower.length !== 0 ? mapNarrower(topConcept.narrower) : []
      }
    ));
    function mapNarrower(arr: any[]): any {
      return arr.map(((arrElement: any) => (
        {
          name: `${arrElement.notation[0]} - ${arrElement.prefLabel.de}`,
          children: arrElement.narrower ? mapNarrower(arrElement.narrower) : []
        }
      )));
    }
    this.dataSource.data = mappedData;
  }

  hasChild = (_: number, node: NotationNode) => !!node.children && node.children.length > 0;
}
