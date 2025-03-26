import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { MatSelectionList, MatListOption } from '@angular/material/list';
import { MatTooltip } from '@angular/material/tooltip';
import { MatFabAnchor, MatAnchor } from '@angular/material/button';

import { ReviewService } from '../../services/review.service';

@Component({
  selector: 'studio-lite-unit-nav',
  templateUrl: './unit-nav.component.html',
  styleUrls: ['./unit-nav.component.scss'],
  imports: [MatFabAnchor, MatTooltip, MatAnchor, MatSelectionList, MatListOption, TranslateModule]
})
export class UnitNavComponent {
  constructor(public reviewService: ReviewService) {}
}
