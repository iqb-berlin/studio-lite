import {
  AfterViewInit,
  Component, ElementRef, Input, ViewChild
} from '@angular/core';
import { BackendService } from '../../backend.service';
import { ReviewService } from '../../review.service';
import { Comment } from '../../../comments/types/comment';

@Component({
  selector: 'unit-info-comments',
  template: `
    <div fxLayout="column">
      <div class="unit-info-comment-header">Kommentare</div>
      <div class="unit-info-comment-content" *ngFor="let c of allComments">
        <h4>{{c.userName}}</h4>
        <div [innerHTML]="c.body"></div>
      </div>
    </div>
  `,
  styles: [
    `.unit-info-comment-header {
      align-content: stretch;
      background-color: rgba(87,247,147,0.32);
      font-size: large;
      padding: 2px 6px;
    }`,
    `.unit-info-comment-content h4 {
      border-top: 1px solid darkgray;
    }`
  ]
})
export class UnitInfoCommentsComponent implements AfterViewInit {
  @ViewChild('commentsContent') contentElement!: ElementRef;
  _unitDbId = 0;
  @Input('unitDbId')
  set unitDbId(value: number) {
    this._unitDbId = value;
    this.updateContent();
  }

  allComments: Comment[] = [];

  constructor(
    private backendService: BackendService,
    public reviewService: ReviewService
  ) {}

  ngAfterViewInit() {
    setTimeout(() => {
      this.updateContent();
    });
  }

  updateContent() {
    if (this._unitDbId) {
      this.backendService.getUnitComments(this.reviewService.reviewId, this._unitDbId).subscribe(unitComments => {
        this.allComments = unitComments;
      });
    }
  }
}
