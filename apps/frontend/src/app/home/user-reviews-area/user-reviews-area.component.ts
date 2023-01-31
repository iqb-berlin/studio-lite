import {
  Component, Input
} from '@angular/core';
import { ReviewDto } from '@studio-lite-lib/api-dto';

@Component({
  selector: 'studio-lite-user-reviews-area',
  templateUrl: './user-reviews-area.component.html',
  styleUrls: ['./user-reviews-area.component.scss']
})
export class UserReviewsAreaComponent {
  @Input() reviews!: ReviewDto[];
  @Input() isReviewUser!: boolean;
}
