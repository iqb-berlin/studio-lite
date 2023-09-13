import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ReviewService } from '../../services/review.service';
import { AppService } from '../../../../services/app.service';

@Component({
  selector: 'studio-lite-start',
  templateUrl: './start.component.html',
  styleUrls: ['./start.component.scss']
})

export class StartComponent implements OnInit {
  constructor(
    public reviewService: ReviewService,
    private appService: AppService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    setTimeout(() => {
      if (this.reviewService.units.length === 0) {
        this.reviewService.loadReviewData();
      }
      this.appService.appConfig.hideTitlesOnPage = true;
      this.reviewService.setHeaderText(this.translate.instant('home.home-page'));
      this.reviewService.currentUnitSequenceId = -1;
    });
  }
}
