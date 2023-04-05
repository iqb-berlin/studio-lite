import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, Inject } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';

export interface InputTextData {
  title: string,
  prompt: string,
  default: string,
  okButtonLabel: string
}

@Component({
  selector: 'studio-lite-input-text',
  templateUrl: './input-text.component.html',
  styleUrls: ['./input-text.component.scss']
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
