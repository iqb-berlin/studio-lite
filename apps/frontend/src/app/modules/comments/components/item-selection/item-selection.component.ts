import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { TranslateModule } from '@ngx-translate/core';
import { MatOption, MatSelect } from '@angular/material/select';
import { UnitItemDto } from '@studio-lite-lib/api-dto';

@Component({
  selector: 'studio-lite-item-selection',
  templateUrl: './item-selection.component.html',
  styleUrls: ['./item-selection.component.scss'],
  imports: [MatFormField, MatLabel, MatSelect, MatOption, TranslateModule]
})
export class ItemSelectionComponent {
  @Input() selectedItems: string[] = [];
  @Input() unitItems: UnitItemDto[] = [];
  @Input() label: string = '';
  @Input() disabled: boolean = false;

  @Output() selectedItemsChange = new EventEmitter<string[]>();

  onSelectedItemChange(items: string[]): void {
    this.selectedItemsChange.emit(items);
  }
}
