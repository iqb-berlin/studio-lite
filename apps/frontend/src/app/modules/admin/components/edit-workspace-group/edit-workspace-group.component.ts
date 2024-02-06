import { Component, Inject } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EditWorkspaceGroupComponentData } from '../../models/edit-workspace-group-component-data.type';

@Component({
  selector: 'studio-lite-edit-workspace-group',
  templateUrl: './edit-workspace-group.component.html',
  styleUrls: ['./edit-workspace-group.component.scss']
})
export class EditWorkspaceGroupComponent {
  editWorkspaceGroupForm: UntypedFormGroup;
  name = this.data.wsg?.name || '';
  constructor(private fb: UntypedFormBuilder,
              @Inject(MAT_DIALOG_DATA) public data: EditWorkspaceGroupComponentData) {
    this.editWorkspaceGroupForm = this.fb.group({
      name: this.fb.control(this.name, [Validators.required, Validators.minLength(3)])
    });
  }
}
