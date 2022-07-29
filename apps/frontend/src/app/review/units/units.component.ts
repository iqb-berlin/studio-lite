import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { AppService } from '../../app.service';
import { ReviewService } from '../review.service';

@Component({
  selector: 'studio-lite-units',
  templateUrl: './units.component.html',
  styleUrls: ['./units.component.scss']
})
export class UnitsComponent implements OnInit, OnDestroy {
  routingSubscription: Subscription | null = null;
  postMessageSubscription: Subscription | null = null;

  constructor(
    private route: ActivatedRoute,
    public appService: AppService,
    public reviewService: ReviewService
  ) {}

  ngOnInit(): void {
    setTimeout(() => {
      this.postMessageSubscription = this.appService.postMessage$
        .subscribe(messageEvent => this.handleIncomingMessage(messageEvent));
      this.routingSubscription = this.route.params.subscribe(params => {
        this.reviewService.currentUnitSequenceId = parseInt(params['u'], 10);
        this.reviewService.units.forEach(u => {
          if (this.reviewService.currentUnitSequenceId === u.sequenceId) {
            this.reviewService.currentPageHeader = u.name;
          }
        });
      });
    });
  }

  ngOnDestroy() {
    if (this.routingSubscription) this.routingSubscription.unsubscribe();
    if (this.postMessageSubscription) this.postMessageSubscription.unsubscribe();
  }

  private handleIncomingMessage(messageEvent: MessageEvent) {

  }
}
