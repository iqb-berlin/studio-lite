import { Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { MatTooltip } from '@angular/material/tooltip';
import { MatAnchor } from '@angular/material/button';
import { WrappedIconComponent } from '../../../shared/components/wrapped-icon/wrapped-icon.component';

@Component({
  selector: 'studio-lite-start-review-button',
  templateUrl: './start-review-button.component.html',
  styleUrls: ['./start-review-button.component.scss'],
  imports: [MatAnchor, MatTooltip, WrappedIconComponent, TranslateModule]
})
export class StartReviewButtonComponent {
  @Input() selectedReviewId!: number;
  @Input() unitCount!: number;
  locationOrigin!: string;
  constructor() {
    this.locationOrigin = window.location.origin;
  }
}
