import { Component, Input, signal } from '@angular/core';

@Component({
  selector: 'studio-lite-nested-tree-node',
  templateUrl: './nested-tree-node.component.html',
  styleUrls: ['./nested-tree-node.component.scss']

})

export class NestedTreeNodeComponent {
  checkboxSelected = signal<boolean>(false);
  @Input() node = {
    url: '', name: '', description: '', notation: '', selected: false
  };

  @Input() values:Array<string> = [];
  onSelect() {
    this.checkboxSelected.set(!this.checkboxSelected());
    if (this.checkboxSelected()) {
      this.values.push(this.node.notation);
    } else {
      this.values.filter((value, index) => {
        if (value === this.node.notation) {
          // Removes the value from the original array
          this.values.splice(index, 1);
          return true;
        }
        return false;
      });
    }
  }
}
