import {
  Component, Input, OnInit
} from '@angular/core';
import { ReviewDto } from '@studio-lite-lib/api-dto';
import { TranslateModule } from '@ngx-translate/core';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { MatButton } from '@angular/material/button';
import { LogoutDirective } from '../../directives/logout.directive';
import { AreaTitleComponent } from '../area-title/area-title.component';
import { ReviewTableComponent } from '../review-table/review-table.component';

@Component({
  selector: 'studio-lite-user-reviews-area',
  templateUrl: './user-reviews-area.component.html',
  styleUrls: ['./user-reviews-area.component.scss'],
  // eslint-disable-next-line max-len
  imports: [AreaTitleComponent, MatButton, LogoutDirective, MatTooltip, MatIcon, TranslateModule, ReviewTableComponent]
})
export class UserReviewsAreaComponent implements OnInit {
  @Input() reviews!: ReviewDto[];
  @Input() isReviewUser!: boolean;

  groupedReviews: { groupName: string; groupId: number, reviews: ReviewDto[] }[] = [];

  ngOnInit(): void {
    this.groupedReviews = this.reviews
      .reduce((groups, review) => {
        const groupName = review.workspaceGroupName || '';
        const groupId = review.workspaceGroupId || 0;
        let existingGroup = groups.find(g => g.groupId === groupId);
        if (!existingGroup) {
          existingGroup = { groupName: groupName, groupId: groupId, reviews: [] };
          groups.push(existingGroup);
        }
        existingGroup.reviews.push(review);
        return groups;
      }, [] as { groupName: string; groupId: number; reviews: ReviewDto[] }[])
      .sort((a, b) => a.groupName.localeCompare(b.groupName));
  }
}
