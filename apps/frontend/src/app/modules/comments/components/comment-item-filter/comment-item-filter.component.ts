import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { MatListOption, MatSelectionList } from '@angular/material/list';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { TranslateModule } from '@ngx-translate/core';
import { MatFabButton } from '@angular/material/button';
import { UnitItemDto } from '@studio-lite-lib/api-dto';
import { MatIcon } from '@angular/material/icon';
import { MatBadge } from '@angular/material/badge';
import { FormsModule } from '@angular/forms';
import { MatTooltip } from '@angular/material/tooltip';

@Component({
  selector: 'studio-lite-comment-item-filter',
  imports: [
    MatListOption,
    MatMenu,
    MatSelectionList,
    TranslateModule,
    MatFabButton,
    MatIcon,
    MatFabButton,
    MatBadge,
    MatMenuTrigger,
    FormsModule,
    MatTooltip
  ],
  templateUrl: './comment-item-filter.component.html',
  styleUrl: './comment-item-filter.component.scss'
})
export class CommentItemFilterComponent {
  @Input() filteredItems: string[] = [];
  @Input() unitItems: UnitItemDto[] = [];

  @Output() filteredItemsChange = new EventEmitter<string[]>();
}
