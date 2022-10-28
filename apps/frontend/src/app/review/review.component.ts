import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ModuleService } from '@studio-lite/studio-components';
import { ReviewService } from './review.service';
import { BackendService } from './backend.service';
import { BackendService as AppBackendService } from '../backend.service';
import { AppService } from '../app.service';
import { CommentDialogComponent } from './comment-dialog.component';

@Component({
  selector: 'studio-lite-review',
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.scss']
})
export class ReviewComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    public appService: AppService,
    private backendService: BackendService,
    private appBackendService: AppBackendService,
    private commentDialog: MatDialog,
    private moduleService: ModuleService,
    public reviewService: ReviewService
  ) {
  }

  ngOnInit(): void {
    setTimeout(() => {
      // eslint-disable-next-line @typescript-eslint/dot-notation
      this.reviewService.reviewId = this.route.snapshot.params['review'];
      this.moduleService.loadList().then(() => {
        this.backendService.getReview(this.reviewService.reviewId).subscribe(reviewData => {
          this.appService.appConfig.setPageTitle('Review', true);
          if (reviewData) {
            this.reviewService.reviewName = reviewData.name ? reviewData.name : '?';
            this.reviewService.workspaceName = reviewData.workspaceName ? reviewData.workspaceName : '?';
            this.reviewService.workspaceId = reviewData.workspaceId ? reviewData.workspaceId : 0;
            this.reviewService.units = [];
            if (reviewData.units) {
              let counter = 0;
              reviewData.units.forEach(u => {
                this.reviewService.units.push({
                  databaseId: u,
                  sequenceId: counter,
                  name: `Aufgabe ${(counter + 1).toString()}`,
                  definition: '',
                  playerId: '',
                  responses: ''
                });
                counter += 1;
              });
            }
            this.reviewService.reviewConfig = reviewData.settings && reviewData.settings.reviewConfig ?
              reviewData.settings.reviewConfig : {};
            this.reviewService.bookletConfig = reviewData.settings && reviewData.settings.bookletConfig ?
              reviewData.settings.bookletConfig : {};
          }
        });
      });
    });
  }

  showReviewDialog() {
    this.commentDialog.open(CommentDialogComponent, {
      width: '800px',
      height: this.reviewService.reviewConfig.showOthersComments ? '800px' : '350px'
    });
  }
}
