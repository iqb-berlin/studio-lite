import { Component, OnDestroy } from '@angular/core';
import { FieldType } from '@ngx-formly/material';
import { MatDialog } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';
import { FormControl } from '@angular/forms';
import { FieldTypeConfig } from '@ngx-formly/core';
import { NestedTreeComponent } from '../nested-tree/nested-tree.component';
import { SelectedNode } from '../../models/types';

@Component({
  selector: 'studio-lite-formly-chips',
  templateUrl: './formly-chips.component.html',
  styleUrls: ['./formly-chips.component.scss']
})
export class FormlyChipsComponent extends FieldType<FieldTypeConfig> implements OnDestroy {
  private ngUnsubscribe = new Subject<void>();
  itemControl = new FormControl();
  selectedNodes: Array<SelectedNode> = [];

  constructor(
    private vocabsDialog : MatDialog
  ) {
    super();
  }

  override ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  override get empty() { return this.formControl.value.length === 0; }

  remove(i: number): void {
    const value = this.formControl.value;

    this.formControl.setValue([
      ...value.slice(0, i),
      ...value.slice(i + 1, value.length)
    ]);
    this.formControl.markAsTouched();
  }

  onBlur(): void {
    this.formControl.markAsTouched();
    this.field.focus = false;
  }

  private addChip(name: string, id: string): void {
    this.formControl.setValue([
      ...this.formControl.value,
      { name, id }
    ]);
  }

  showNodeTree(): void {
    const dialogRef = this.vocabsDialog.open(NestedTreeComponent, {
      data: {
        value: this.formControl.value,
        selectedNodes: this.selectedNodes,
        props: this.props
      },
      width: '800px'
    });

    dialogRef.afterClosed()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(results => {
        this.formControl.reset();
        results.forEach((node:SelectedNode) => {
          if (node.notation) node.label = node.notation;
          this.addChip(node.label, node.id);
        });
      });
  }
}
