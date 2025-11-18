import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { MatDivider, MatListOption, MatSelectionList } from '@angular/material/list';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { TranslateModule } from '@ngx-translate/core';
import { MatMiniFabButton } from '@angular/material/button';
import { UnitItemDto } from '@studio-lite-lib/api-dto';
import { MatIcon } from '@angular/material/icon';
import { MatBadge } from '@angular/material/badge';
import { FormsModule } from '@angular/forms';
import { MatTooltip } from '@angular/material/tooltip';
import { BehaviorSubject } from 'rxjs';
import { MatSlideToggle } from '@angular/material/slide-toggle';

@Component({
  selector: 'studio-lite-comment-item-filter',
  imports: [
    MatListOption,
    MatMenu,
    MatSelectionList,
    TranslateModule,
    MatIcon,
    MatBadge,
    MatMenuTrigger,
    FormsModule,
    MatTooltip,
    MatMiniFabButton,
    MatDivider,
    MatSlideToggle
  ],
  templateUrl: './comment-filter.component.html',
  styleUrl: './comment-filter.component.scss'
})
export class CommentFilterComponent {
  @Input() showHiddenComments!: BehaviorSubject<boolean>;
  @Input() filteredItems: string[] = [];
  @Input() unitItems: UnitItemDto[] = [];

  @Output() filteredItemsChange = new EventEmitter<string[]>();
  @Output() showHiddenCommentsChange = new EventEmitter<boolean>();
}
