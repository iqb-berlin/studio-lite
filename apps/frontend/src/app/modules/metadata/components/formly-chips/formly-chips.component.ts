import { Component, OnDestroy } from '@angular/core';
import { FieldType } from '@ngx-formly/material';
import { MatDialog } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';
import { FormControl } from '@angular/forms';
import { FieldTypeConfig } from '@ngx-formly/core';
import { NestedTreeComponent } from '../nested-tree/nested-tree.component';
import * as vocab from './Bildungsstandards-Mathematik-Primar-2022-Inhaltsbezogene-Kompetenzen.json';

@Component({
  selector: 'studio-lite-formly-chips',
  templateUrl: './formly-chips.component.html',
  styleUrls: ['./formly-chips.component.scss']
})
export class FormlyChipsComponent extends FieldType<FieldTypeConfig> implements OnDestroy {
  private ngUnsubscribe = new Subject<void>();
  itemControl = new FormControl();

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

  private addChip(name: string): void {
    this.formControl.setValue([
      ...this.formControl.value,
      { name }
    ]);
  }

  showNodeTree(): void {
    const dialogRef = this.vocabsDialog.open(NestedTreeComponent, {
      data: vocab,
      width: '80%',
      height: '80%'
    });

    dialogRef.afterClosed()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(results => {
        results.forEach((nodeName: string) => this.addChip(nodeName));
      });
  }
}
