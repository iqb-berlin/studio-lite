import {
  Component, EventEmitter, Input, OnInit, Output, signal, ViewChild
} from '@angular/core';

import { MatCheckbox } from '@angular/material/checkbox';
import { NestedTreeParameters, NotationNode, SelectedNode } from '../../models/types';

@Component({
  selector: 'studio-lite-nested-tree-node',
  templateUrl: './nested-tree-node.component.html',
  styleUrls: ['./nested-tree-node.component.scss']

})

export class NestedTreeNodeComponent implements OnInit {
  @ViewChild('checkbox') matCheckbox!:MatCheckbox;
  checkboxSelected = signal<boolean>(false);
  description = signal<string>('');

  @Output() selectionChange:
  EventEmitter<{ state: boolean; node: SelectedNode, expandable:boolean }> =
      new EventEmitter<{ state: boolean; node: SelectedNode, expandable:boolean }>();

  @Output() descriptionChange:
  EventEmitter<{ description: string; node: SelectedNode }> =
      new EventEmitter<{ description: string; node: SelectedNode }>();

  @Input() params: NestedTreeParameters = {
    url: '',
    allowMultipleValues: false,
    maxLevel: 0,
    hideNumbering: false,
    hideDescription: false,
    hideTitle: false,
    addTextLanguages: []
  };

  @Input() node!:NotationNode;
  @Input() selectedNodes:Array<SelectedNode> = [];
  @Input() totalSelected!:number;
  @Input() expandableNode!:boolean;
  onSelect() {
    this.selectionChange.emit({
      state: !this.checkboxSelected(),
      node: {
        id: this.node.id,
        label: this.node.label || '',
        notation: this.node.notation || '',
        description: this.node.description
      },
      expandable: this.expandableNode
    });
    this.checkboxSelected.set(!this.checkboxSelected());
  }

  onInput(value:string) {
    this.description.set(value);
    this.descriptionChange.emit({
      description: this.description(),
      node: {
        id: this.node.id,
        label: this.node.label || '',
        notation: this.node.notation,
        description: this.description()
      }
    });

    const index = this.selectedNodes.findIndex(val => val.id === this.node.id);
    this.selectedNodes[index] = {
      id: this.node.id,
      notation: this.node.notation,
      label: this.node.label || '',
      description: this.description()
    };
  }

  ngOnInit(): void {
    if (this.node.selected) this.checkboxSelected.set(true);
    if (this.node.description) this.description.set(this.node.description);
  }
}
