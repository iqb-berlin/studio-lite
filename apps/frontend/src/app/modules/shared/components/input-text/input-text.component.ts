import {
  MAT_DIALOG_DATA, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose
} from '@angular/material/dialog';
import { Component, Inject } from '@angular/core';
import {
  UntypedFormGroup, UntypedFormBuilder, Validators, FormsModule, ReactiveFormsModule
} from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MatButton } from '@angular/material/button';
import { MatInput } from '@angular/material/input';
import { MatFormField } from '@angular/material/form-field';

export interface InputTextData {
  title: string,
  prompt: string,
  default: string,
  okButtonLabel: string,
  isBackUpWorkspaceGroup: boolean,
  maxWorkspaceCount: number,
  workspacesCount: number
}

@Component({
  selector: 'studio-lite-input-text',
  templateUrl: './input-text.component.html',
  styleUrls: ['./input-text.component.scss'],
  // eslint-disable-next-line max-len
  imports: [MatDialogTitle, MatDialogContent, FormsModule, ReactiveFormsModule, MatFormField, MatInput, MatDialogActions, MatButton, MatDialogClose, TranslateModule]
})
export class InputTextComponent {
  textInputForm: UntypedFormGroup;
  typedData: InputTextData;

  constructor(private fb: UntypedFormBuilder,
              @Inject(MAT_DIALOG_DATA) public data: unknown) {
    this.typedData = data as InputTextData;
    this.textInputForm = this.fb.group({
      text: this.fb.control(this.typedData.default, [Validators.required])
    });
  }
}
