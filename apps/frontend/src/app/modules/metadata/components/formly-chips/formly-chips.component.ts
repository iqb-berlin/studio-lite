import { Component, OnDestroy } from '@angular/core';
import { FieldType } from '@ngx-formly/material';
import { MatDialog } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';
import { FormControl } from '@angular/forms';
import { FieldTypeConfig } from '@ngx-formly/core';
import { NestedTreeComponent } from '../nested-tree/nested-tree.component';
import { SelectedNode } from '../../models/types';
import { MetadataService } from '../../services/metadata.service';

interface FormlyNode extends SelectedNode {
  name:string
}
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
    private vocabsDialog : MatDialog,
    private metadataService : MetadataService
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

  showNodeTree(): void {
    const dialogRef = this.vocabsDialog.open(NestedTreeComponent, {
      data: {
        value: this.formControl.value,
        props: this.props,
        vocabularies: this.metadataService.vocabularies
      },
      width: '600px'
    });

    dialogRef.afterClosed()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(results => {
        // this.formControl.reset();
        if (results) {
          const mappedResults = results
            .map((result:FormlyNode) => ({
              name: `${result.notation}  ${this.metadataService.vocabulariesIdDictionary[result.id].labels.de}`,
              id: result.id,
              notation: result.notation,
              text: [{ lang: 'de', value: result.description }]
            }))
            .sort((a:FormlyNode, b:FormlyNode) => {
              const nameA = a.name.toUpperCase(); // ignore upper and lowercase
              const nameB = b.name.toUpperCase(); // ignore upper and lowercase
              if (nameA < nameB) {
                return -1;
              }
              if (nameA > nameB) {
                return 1;
              }
              return 0;
            });
          this.formControl.setValue(mappedResults);
        }
      });
  }
}
