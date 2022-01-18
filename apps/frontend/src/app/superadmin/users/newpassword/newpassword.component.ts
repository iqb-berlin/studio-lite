import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  templateUrl: './newpassword.component.html'
})

export class NewpasswordComponent {
  newpasswordform: FormGroup;

  constructor(private fb: FormBuilder,
              @Inject(MAT_DIALOG_DATA) public data: any) {
    this.newpasswordform = this.fb.group({
      pw: this.fb.control('', [Validators.required, Validators.minLength(3), Validators.pattern(/^\S+$/)])
    });
  }
}
