import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'studio-lite-print-review-button',
  templateUrl: './print-review-button.component.html',
  styleUrls: ['./print-review-button.component.scss']
})
export class PrintReviewButtonComponent {
  @Input() workspaceId!: number;
  @Input() units!: number[];
  @Input() selectedReviewId!: number;

  constructor(private router: Router) {}

  printReview(): void {
    const url = this.router
      .serializeUrl(this.router
        .createUrlTree(['/print'], {
          queryParams: {
            unitIds: this.units,
            workspaceId: this.workspaceId
          }
        }));
    window.open(`#${url}`, '_blank');
  }
}
