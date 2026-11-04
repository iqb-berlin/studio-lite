import { Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { MatIcon } from '@angular/material/icon';
import { DatePipe } from '@angular/common';
import { ItemsMetadataValues } from '@studio-lite-lib/api-dto';
import { Comment } from '../../../comments/models/comment.interface';
import { SortAscendingPipe } from '../../../comments/pipes/sort-ascending.pipe';
import { MapItemUuidsIdsPipe } from '../../../comments/pipes/map-item-uuids-ids.pipe';

/**
 * One comment of the printed list: author, date, the items it is about, and the text. A reply is
 * marked and indented; where it stands is decided by the list (#2109).
 */
@Component({
  selector: 'studio-lite-unit-print-comment',
  templateUrl: './unit-print-comment.component.html',
  styleUrls: ['./unit-print-comment.component.scss'],
  imports: [MatIcon, DatePipe, TranslateModule, SortAscendingPipe, MapItemUuidsIdsPipe]
})
export class UnitPrintCommentComponent {
  @Input() comment!: Comment;
  @Input() metadata!: ItemsMetadataValues[] | null;
  @Input() isReply = false;
  /** Whether a line separates this comment from the thread before it */
  @Input() divided = false;
}
