import {
  Component, Input
} from '@angular/core';
import { ReviewDto } from '@studio-lite-lib/api-dto';
import { UserIssuesPipe } from '../../pipes/issues-pipe.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { UserIssuesComponent } from '../user-issues/user-issues.component';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { LogoutDirective } from '../../directives/logout.directive';
import { MatButton } from '@angular/material/button';
import { NgIf } from '@angular/common';
import { AreaTitleComponent } from '../area-title/area-title.component';

@Component({
    selector: 'studio-lite-user-reviews-area',
    templateUrl: './user-reviews-area.component.html',
    styleUrls: ['./user-reviews-area.component.scss'],
    standalone: true,
    imports: [AreaTitleComponent, NgIf, MatButton, LogoutDirective, MatTooltip, MatIcon, UserIssuesComponent, TranslateModule, UserIssuesPipe]
})
export class UserReviewsAreaComponent {
  @Input() reviews!: ReviewDto[];
  @Input() isReviewUser!: boolean;
}
