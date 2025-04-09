import {
  Component, Input, OnChanges, SimpleChanges
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { MatIcon } from '@angular/material/icon';
import { DatePipe } from '@angular/common';
import { Comment } from '../../../comments/models/comment.interface';
import { BackendService } from '../../../comments/services/backend.service';

@Component({
  selector: 'studio-lite-unit-print-comments',
  templateUrl: './unit-print-comments.component.html',
  styleUrls: ['./unit-print-comments.component.scss'],
  imports: [MatIcon, DatePipe, TranslateModule]
})
export class UnitPrintCommentsComponent implements OnChanges {
  @Input() unitId!: number;
  @Input() workspaceId!: number;
  @Input() reviewId: number = 0;
  @Input() comments: Comment[] = [];

  constructor(
    private backendService: BackendService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    const { unitId, workspaceId, reviewId } = changes;
    if (unitId || workspaceId || reviewId) {
      this.fetchComments();
    }
  }

  private fetchComments(): void {
    this.backendService
      .getComments(this.workspaceId, this.unitId, this.reviewId)
      // eslint-disable-next-line no-return-assign
      .subscribe(comments => this.setComments(comments));
  }

  private setComments(comments: Comment[]): void {
    this.comments = comments;
  }
}
