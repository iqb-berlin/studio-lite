import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, Inject } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MyData } from '../../models/my-data.interface';

@Component({
  selector: 'studio-lite-edit-my-data',
  templateUrl: './edit-my-data.component.html',
  styleUrls: ['./edit-my-data.component.scss']
})

export class EditMyDataComponent {
  editUserForm: UntypedFormGroup;
  constructor(private fb: UntypedFormBuilder,
              @Inject(MAT_DIALOG_DATA) public data: MyData) {
    this.editUserForm = this.fb
      .group({
        lastName: this.fb.control(this.data.lastName),
        firstName: this.fb.control(this.data.firstName),
        email: this.fb.control(this.data.email),
        emailPublishApproval: this.fb.control(this.data.emailPublishApproved),
        description: this.fb.control(this.data.description)
      });
  }
}
