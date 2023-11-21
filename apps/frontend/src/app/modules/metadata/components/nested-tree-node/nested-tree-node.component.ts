import {
  Component, EventEmitter, Input, OnInit, Output, signal, ViewChild
} from '@angular/core';

import { MatCheckbox } from '@angular/material/checkbox';
import { NestedTreeParameters, NotationNode } from '../../models/types';

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
  EventEmitter<{ state: boolean; node: NotationNode }> =
      new EventEmitter<{ state: boolean; node: NotationNode }>();

  @Output() descriptionChange:
  EventEmitter<{ description: string; node: NotationNode }> =
      new EventEmitter<{ description: string; node: NotationNode }>();

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
  @Input() selectedNodes:Array<NotationNode> = [];
  @Input() totalSelected!:number;
  @Input() expandableNode!:boolean;
  onSelect() {
    this.selectionChange.emit({
      state: !this.checkboxSelected(),
      node: this.node
    });
    this.checkboxSelected.set(!this.checkboxSelected());
  }

  onInput(value:string) {
    this.description.set(value);
    this.descriptionChange.emit({
      description: this.description(),
      node: this.node
    });

    const index = this.selectedNodes.findIndex(val => val.id === this.node.id);
    this.selectedNodes[index] = {
      ...this.node,
      description: this.description()
    };
  }

  ngOnInit(): void {
    if (this.node && this.node.selected) this.checkboxSelected.set(true);
    if (this.node && this.node.description) this.description.set(this.node.description);
  }
}
