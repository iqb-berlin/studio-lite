import {
  Component, Input
} from '@angular/core';
import { ReviewDto } from '@studio-lite-lib/api-dto';

@Component({
  selector: 'studio-lite-user-reviews',
  templateUrl: './user-reviews.component.html',
  styleUrls: ['./user-reviews.component.scss']
})
export class UserReviewsComponent {
  @Input() reviews!: ReviewDto[];
  @Input() isReviewUser!: boolean;
}
