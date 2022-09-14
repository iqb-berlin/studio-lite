import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MessageDialogComponent, MessageDialogData, MessageType } from '@studio-lite-lib/iqb-components';
import { VeronaModuleInListDto } from '@studio-lite-lib/api-dto';
import { ReviewService } from './review.service';
import { BackendService } from './backend.service';
import { BackendService as AppBackendService } from '../backend.service';
import { AppService } from '../app.service';
import { VeronaModuleCollection } from '../classes/verona-module-collection.class';

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
    private messageDialog: MatDialog,
    public reviewService: ReviewService
  ) {
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.reviewService.reviewId = this.route.snapshot.params['review'];
      this.appBackendService.getModuleList('editor').subscribe((moduleList: VeronaModuleInListDto[]) => {
        this.appService.editorList = new VeronaModuleCollection(moduleList);
      });
      this.appBackendService.getModuleList('player').subscribe((moduleList: VeronaModuleInListDto[]) => {
        this.appService.playerList = new VeronaModuleCollection(moduleList);
      });
      this.appBackendService.getModuleList('schemer').subscribe((moduleList: VeronaModuleInListDto[]) => {
        this.appService.schemerList = new VeronaModuleCollection(moduleList);
      });
      this.backendService.getReview(this.reviewService.reviewId).subscribe(reviewData => {
        this.appService.appConfig.setPageTitle('Review', true);
        if (reviewData) {
          this.reviewService.reviewName = reviewData.name ? reviewData.name : '?';
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
          this.reviewService.reviewSettings = reviewData.settings;
        }
      });
    });
  }

  showReviewDialog() {
    this.messageDialog.open(MessageDialogComponent, {
      width: '400px',
      data: <MessageDialogData>{
        title: 'ReviewDialog',
        content: 'coming soon',
        type: MessageType.warning
      }
    });
  }
}
