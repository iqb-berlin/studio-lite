import {
  AfterViewInit, Component, Input, ViewChild
} from '@angular/core';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { ReviewDto } from '@studio-lite-lib/api-dto';
import { I18nService } from '../../services/i18n.service';

@Component({
  selector: 'studio-lite-review-table',
  imports: [
    CommonModule,
    MatTableModule,
    MatSortModule,
    TranslateModule,
    RouterModule
  ],
  templateUrl: './review-table.component.html',
  styleUrls: ['./review-table.component.scss']
})

export class ReviewTableComponent implements AfterViewInit {
  @ViewChild(MatSort) sort = new MatSort();
  @Input() reviews: ReviewDto[] = [];
  @Input() groupName: string = '';

  dataSource = new MatTableDataSource<ReviewDto>([]);
  displayedColumns: string[] = [
    'name',
    'workspaceName',
    'changedAt'
  ];

  constructor(public i18nService: I18nService) {}

  ngAfterViewInit(): void {
    this.dataSource.data = this.reviews;
    this.dataSource.sort = this.sort;
  }
}
