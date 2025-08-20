import {
  Component, Input
} from '@angular/core';
import { ReviewDto } from '@studio-lite-lib/api-dto';
import { TranslateModule } from '@ngx-translate/core';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { MatButton } from '@angular/material/button';

import { LogoutDirective } from '../../directives/logout.directive';
import { UserIssuesComponent } from '../user-issues/user-issues.component';
import { AreaTitleComponent } from '../area-title/area-title.component';
import { UserIssuesPipe } from '../../pipes/user-issues.pipe';

@Component({
  selector: 'studio-lite-user-reviews-area',
  templateUrl: './user-reviews-area.component.html',
  styleUrls: ['./user-reviews-area.component.scss'],
  // eslint-disable-next-line max-len
  imports: [AreaTitleComponent, MatButton, LogoutDirective, MatTooltip, MatIcon, UserIssuesComponent, TranslateModule, UserIssuesPipe]
})
export class UserReviewsAreaComponent {
  @Input() reviews!: ReviewDto[];
  @Input() isReviewUser!: boolean;
}
