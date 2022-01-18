import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  templateUrl: './newuser.component.html',
  styleUrls: ['./newuser.component.css']
})
export class NewuserComponent {
  newuserform: FormGroup;

  constructor(private fb: FormBuilder,
              @Inject(MAT_DIALOG_DATA) public data: any) {
    this.newuserform = this.fb.group({
      name: this.fb.control('', [Validators.required, Validators.minLength(3), Validators.pattern(/^\S+$/)]),
      pw: this.fb.control('', [Validators.required, Validators.minLength(3), Validators.pattern(/^\S+$/)])
    });
  }
}
