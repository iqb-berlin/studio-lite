import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { MatSelectionList, MatListOption } from '@angular/material/list';
import { MatTooltip } from '@angular/material/tooltip';
import { MatFabAnchor, MatAnchor } from '@angular/material/button';
import { NgIf, NgFor } from '@angular/common';
import { ReviewService } from '../../services/review.service';

@Component({
  selector: 'studio-lite-unit-nav',
  templateUrl: './unit-nav.component.html',
  styleUrls: ['./unit-nav.component.scss'],
  standalone: true,
  imports: [NgIf, MatFabAnchor, MatTooltip, MatAnchor, MatSelectionList, MatListOption, NgFor, TranslateModule]
})
export class UnitNavComponent {
  constructor(public reviewService: ReviewService) {}
}
