import {
  Component
} from '@angular/core';
import {
  FormGroup, UntypedFormBuilder, UntypedFormGroup
} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { ModuleService } from '../../../shared/services/module.service';
import { WorkspaceService } from '../../services/workspace.service';
import { NestedTreeComponent } from '../../../shared/components/nested-tree/nested-tree.component';
import * as vocab from './vocabs/Bildungsstandards-Mathematik-Primar-2022-Inhaltsbezogene-Kompetenzen.json';

@Component({
  templateUrl: './unit-metadata.component.html',
  styleUrls: ['unit-metadata.component.scss']
})

export class UnitMetadataComponent {
  selections = [{ name: '' }];
  unitForm: UntypedFormGroup;
  timeZone = 'Europe/Berlin';
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
    private fb: UntypedFormBuilder,
    public workspaceService: WorkspaceService,
    public moduleService: ModuleService,
    private vocabsDialog : MatDialog
  ) {
    this.timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    this.unitForm = this.fb.group({
      key: this.fb.control(''),
      name: this.fb.control(''),
      description: this.fb.control('')
    });
  }

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
      )
      );
    });
  }
}
