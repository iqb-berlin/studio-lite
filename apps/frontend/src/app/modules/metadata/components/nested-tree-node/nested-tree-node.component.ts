import {
  Component, EventEmitter, Input, OnInit, Output, signal
} from '@angular/core';

import { NestedTreeParameters, NotationNode, SelectedNode } from '../../models/types';

@Component({
  selector: 'studio-lite-nested-tree-node',
  templateUrl: './nested-tree-node.component.html',
  styleUrls: ['./nested-tree-node.component.scss']

})

export class NestedTreeNodeComponent implements OnInit {
  checkboxSelected = signal<boolean>(false);
  description = signal<string>('');
  displayText: string = '';

  @Output() selectionChange:
  EventEmitter<{ state: boolean; node: SelectedNode }> = new EventEmitter<{ state: boolean; node: SelectedNode }>();

  @Output() descriptionChange:
  EventEmitter<{ description: string; node: SelectedNode }> = new EventEmitter<{ description: string; node: SelectedNode }>();

  @Input() params: NestedTreeParameters = {
    url: '',
    allowMultipleValues: true,
    maxLevel: 0,
    hideNumbering: false,
    hideDescription: false,
    hideTitle: false,
    addTextLanguages: ['de', 'en']
  };

  @Input() node:NotationNode = {
    url: '', description: '', notation: '', selected: false, id: '', label: '', name: ''
  };

  @Input() selectedNodes:Array<SelectedNode> = [];
  @Input() totalSelected!:number;
  onSelect() {
    this.selectionChange.emit({
      state: !this.checkboxSelected(),
      node: {
        id: this.node.id,
        label: this.node.label || '',
        notation: this.node.notation,
        description: this.node.description
      }
    });
    this.checkboxSelected.set(!this.checkboxSelected());
  }

  onInput(e:any) {
    this.description.set(e.target.value);
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
    if (this.params.hideTitle && !this.params.hideNumbering) { this.displayText = `${this.node.notation}`; }
    if (this.params.hideNumbering && !this.params.hideTitle) { this.displayText = `${this.node.label}`; }
    if (!this.params.hideNumbering && !this.params.hideTitle) {
      this.displayText = `${this.node.notation} - ${this.node.label}`;
    }
    if (this.node.selected) this.checkboxSelected.set(true);
    if (this.node.description) this.description.set(this.node.description);
  }
}
