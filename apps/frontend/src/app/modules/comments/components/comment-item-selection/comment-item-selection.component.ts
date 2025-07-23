import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { TranslateModule } from '@ngx-translate/core';
import { MatOption, MatSelect } from '@angular/material/select';
import { UnitItemDto } from '@studio-lite-lib/api-dto';

@Component({
  selector: 'studio-lite-comment-item-selection',
  imports: [
    MatFormField,
    MatLabel,
    TranslateModule,
    MatSelect,
    MatOption
  ],
  templateUrl: './comment-item-selection.component.html',
  styleUrl: './comment-item-selection.component.scss'
})
export class CommentItemSelectionComponent {
  @Input() selectedItems: string[] = [];
  @Input() unitItems: UnitItemDto[] = [];
  @Input() label: string = '';
  @Input() disabled: boolean = false;

  @Output() selectedItemsChange = new EventEmitter<string[]>();
}
