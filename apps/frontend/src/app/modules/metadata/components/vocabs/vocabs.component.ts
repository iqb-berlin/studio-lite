import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { NestedTreeComponent } from '../nested-tree/nested-tree.component';
import * as vocab from './Bildungsstandards-Mathematik-Primar-2022-Inhaltsbezogene-Kompetenzen.json';

@Component({
  selector: 'studio-lite-vocabs',
  templateUrl: './vocabs.component.html',
  styleUrls: ['./vocabs.component.scss']
})

export class VocabsComponent {
  selections = [{ name: '' }];
  form = new FormGroup({});
  model: any = {};
  fields: FormlyFieldConfig[] = [
    {
      key: 'text',
      type: 'input',
      props: {
        label: 'Text',
        placeholder: 'Type here to see the other field become enabled...'
      }
    }
  ];

  constructor(
    private vocabsDialog : MatDialog
  ) {}

  showVocab() {
    const dialogRef = this.vocabsDialog.open(NestedTreeComponent, {
      data: vocab,
      width: '80%',
      height: '80%'
    });

    dialogRef.afterClosed().subscribe(results => {
      this.selections = results.map((result: Array<string>) => (
        {
          name: result
        }
      ));
    });
  }
}
