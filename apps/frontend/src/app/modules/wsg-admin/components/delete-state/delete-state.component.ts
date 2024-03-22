import { MAT_DIALOG_DATA, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose } from '@angular/material/dialog';
import { Component, Inject } from '@angular/core';
import { State } from '../../../admin/models/state.type';
import { TranslateModule } from '@ngx-translate/core';
import { MatButton } from '@angular/material/button';

export interface DeleteStateData {
  title: string,
  prompt: string,
  state: State,
  okButtonLabel: string
}

@Component({
    selector: 'studio-lite-delete-state',
    templateUrl: './delete-state.component.html',
    styleUrls: ['./delete-state.component.scss'],
    standalone: true,
    imports: [MatDialogTitle, MatDialogContent, MatDialogActions, MatButton, MatDialogClose, TranslateModule]
})
export class DeleteStateComponent {
  typedData: DeleteStateData;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: unknown) {
    this.typedData = data as DeleteStateData;
  }
}
