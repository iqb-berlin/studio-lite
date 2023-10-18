import {
  Component, Input, OnInit, signal
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
  onSelect() {
    this.checkboxSelected.set(!this.checkboxSelected());
    if (this.checkboxSelected()) {
      const isExisting = this.selectedNodes.find((val:SelectedNode):boolean => val.id === this.node.id);
      if (!isExisting) {
        this.selectedNodes.push({
          id: this.node.id,
          notation: this.node.notation,
          label: this.node.label || '',
          description: this.description()
        });
      }
    } else {
      this.selectedNodes.filter((value, index) => {
        if (value.notation === this.node.notation) {
          // Removes the value from the original array
          this.selectedNodes.splice(index, 1);
          return true;
        }
        return false;
      });
    }
  }

  onInput(e:any) {
    this.description.set(e.target.value);
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
