import {
  AfterViewInit, Component, Input, ViewChild
} from '@angular/core';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { ReviewDto } from '@studio-lite-lib/api-dto';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { MatButton } from '@angular/material/button';
import { I18nService } from '../../services/i18n.service';
import { IsNewReviewPipe } from '../../pipes/is-new-review.pipe';
import { WrappedIconComponent } from '../../modules/shared/components/wrapped-icon/wrapped-icon.component';

@Component({
  selector: 'studio-lite-review-table',
  imports: [
    CommonModule,
    MatTableModule,
    MatSortModule,
    TranslateModule,
    RouterModule,
    MatIcon,
    IsNewReviewPipe,
    MatTooltip,
    MatButton,
    WrappedIconComponent
  ],
  templateUrl: './review-table.component.html',
  styleUrls: ['./review-table.component.scss']
})

export class ReviewTableComponent implements AfterViewInit {
  @ViewChild(MatSort) sort = new MatSort();
  @Input() reviews: ReviewDto[] = [];
  @Input() groupName: string = '';

  reviewsView: 'list' | 'details' = 'list';

  dataSource = new MatTableDataSource<ReviewDto>([]);
  displayedColumns: string[] = [
    'name'
  ];

  constructor(public i18nService: I18nService) {}

  ngAfterViewInit(): void {
    this.dataSource.data = this.reviews;
    this.dataSource.sort = this.sort;
  }

  toggleView() {
    if (this.reviewsView === 'details') {
      this.reviewsView = 'list';
    } else {
      this.reviewsView = 'details';
    }
    this.toggleDisplayedColumns();
  }

  toggleDisplayedColumns(): void {
    if (this.reviewsView === 'details') {
      this.displayedColumns = [
        'name',
        'workspaceName',
        'changedAt'
      ];
    } else {
      this.displayedColumns = [
        'name'
      ];
    }
    if (this.sort.active !== 'name' || this.sort.direction !== 'asc') {
      this.sort.sort(({
        id: 'name',
        start: 'asc',
        disableClear: true
      }));
    }
  }
}
