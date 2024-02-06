import { Component, OnDestroy } from '@angular/core';
import { FieldType } from '@ngx-formly/material';
import { MatDialog } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';
import { FormControl } from '@angular/forms';
import { FieldTypeConfig } from '@ngx-formly/core';
import { NotationNode } from '../../models/types';
import { MetadataService } from '../../services/metadata.service';
import { NestedTreeComponent } from '../nested-tree/nested-tree.component';

@Component({
  selector: 'studio-lite-formly-chips',
  templateUrl: './formly-chips.component.html',
  styleUrls: ['./formly-chips.component.scss']
})
export class FormlyChipsComponent extends FieldType<FieldTypeConfig> implements OnDestroy {
  private ngUnsubscribe = new Subject<void>();
  itemControl = new FormControl();

  constructor(
    private vocabsDialog: MatDialog,
    private metadataService: MetadataService
  ) {
    super();
  }

  override ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  override get empty() {
    return this.formControl.value.length === 0;
  }

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
      autoFocus: false,
      data: {
        value: this.formControl.value,
        props: this.props,
        vocabularies: this.metadataService.vocabularies
      },
      width: '1200px'
    });

    dialogRef.afterClosed()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((results:{ nodes:NotationNode[], hideNumbering:boolean }) => {
        if (results) {
          const selectedVocabularyEntries = results.nodes
            .map((result: NotationNode) => ({
              name: `${results.hideNumbering ? '' :
                result.notation}  ${this.metadataService.vocabulariesIdDictionary[result.id].labels.de}`.trim(),
              id: result.id,
              notation: result.notation,
              text: [{ lang: 'de', value: `${results.hideNumbering ? '' : result.notation} ${result.label}`.trim() }]
            }))
            .sort((a: NotationNode, b: NotationNode) => {
              const nameA = a.name?.toUpperCase() || '';
              const nameB = b.name?.toUpperCase() || '';
              if (nameA < nameB) {
                return -1;
              }
              if (nameA > nameB) {
                return 1;
              }
              return 0;
            });
          this.formControl.setValue(selectedVocabularyEntries);
        }
      });
  }
}
