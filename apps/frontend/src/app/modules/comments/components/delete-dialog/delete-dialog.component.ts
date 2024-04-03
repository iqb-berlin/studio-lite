import { Component, Inject } from '@angular/core';
import {
  MAT_DIALOG_DATA, MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions
} from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'studio-lite-delete-dialog',
  templateUrl: './delete-dialog.component.html',
  styleUrls: ['./delete-dialog.component.scss'],
  standalone: true,
  imports: [MatDialogTitle, MatDialogContent, MatDialogActions, MatButton, TranslateModule]
})
export class DeleteDialogComponent {
  title!: string;
  content!: string;

  constructor(
    public dialogRef: MatDialogRef<DeleteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { title: string, content:string }
  ) {
    this.title = data.title;
    this.content = data.content;
  }

  confirm() {
    this.dialogRef.close(true);
  }

  decline() {
    this.dialogRef.close(false);
  }
}
