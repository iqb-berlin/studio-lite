import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { ReviewService } from './review.service';

@Component({
  selector: 'studio-lite-review',
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.scss']
})
export class ReviewComponent implements OnInit, OnDestroy {
  private routingSubscription: Subscription | null = null;

  constructor(
    private route: ActivatedRoute,
    public reviewService: ReviewService
  ) {}

  ngOnInit(): void {
    setTimeout(() => {
      this.reviewService.reviewKey = this.route.snapshot.params['review'];
      this.routingSubscription = this.route.params.subscribe(params => {
        this.reviewService.reviewKey = params['review'];
      });
    });
  }

  ngOnDestroy(): void {
    if (this.routingSubscription !== null) {
      this.routingSubscription.unsubscribe();
    }
  }
}
