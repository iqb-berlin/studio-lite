import { Component, OnInit } from '@angular/core';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { MatTooltip } from '@angular/material/tooltip';
import { MatFabAnchor } from '@angular/material/button';
import { MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle } from '@angular/material/expansion';
import { ReviewService } from '../../services/review.service';
import { AppService } from '../../../../services/app.service';
import { BookletConfigShowComponent } from '../booklet-config-show/booklet-config-show.component';

@Component({
  selector: 'studio-lite-start',
  templateUrl: './start.component.html',
  styleUrls: ['./start.component.scss'],
  standalone: true,
  imports: [MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle, BookletConfigShowComponent, MatFabAnchor, MatTooltip, TranslateModule]
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
