import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle
} from '@angular/material/dialog';
import { ItemsMetadataValues } from '@studio-lite-lib/api-dto';
import { MatButton } from '@angular/material/button';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatOption, MatSelect } from '@angular/material/select';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'studio-lite-new-item',
    imports: [CommonModule, MatButton, MatDialogActions, TranslateModule, MatLabel, MatFormField,
        MatSelect, MatOption, MatDialogClose, MatDialogContent, MatDialogTitle, FormsModule],
    templateUrl: './new-item.component.html',
    styleUrl: './new-item.component.scss'
})
export class NewItemComponent {
  options: string[];
  selectedIndex: number = 0;

  constructor(
    private translateService: TranslateService,
    @Inject(MAT_DIALOG_DATA) public data: { items: ItemsMetadataValues[] }) {
    this.options = [
      this.translateService
        .instant('metadata.empty-item'),
      ...data.items
        .map((item, index) => item.id || this.translateService
          .instant('metadata.without-id-number', { number: index + 1 }))
    ];
  }
}
