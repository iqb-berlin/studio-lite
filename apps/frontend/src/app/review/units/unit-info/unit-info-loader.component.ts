import {
  AfterViewInit,
  Component, ElementRef, EventEmitter, Input, OnDestroy, Output
} from '@angular/core';

@Component({
  selector: 'unit-info-loader',
  template: `
    <div id="unit_info_loader_div">
      <mat-spinner *ngIf="spinnerOn" [diameter]="20"></mat-spinner>
    </div>
  `,
  styles: [
    `#unit_info_loader_div {
      background-color: transparent;
      width: 30px;
      margin: 6px;
    }`,
    `.mat-spinner, .mat-progress-spinner {
      opacity: 70%;
    }`
  ]
})
export class UnitInfoLoaderComponent implements AfterViewInit, OnDestroy {
  @Output() onEnter = new EventEmitter<UnitInfoLoaderComponent>();
  intersectionObserver: IntersectionObserver;
  spinnerOn = false;
  @Input('loaderOn')
  set loaderOn(value: boolean) {
    this.spinnerOn = value;
  }

  constructor(
    private elementRef: ElementRef
  ) {
    this.intersectionObserver = new IntersectionObserver(
      (entries: IntersectionObserverEntry[], observer: IntersectionObserver): void => {
        const intersectingEntries = entries.filter(e => e.isIntersecting);
        console.log('# entering');
        if (intersectingEntries && intersectingEntries.length > 0) {
          console.log('# intersecting');
          this.onEnter.emit(this);
          observer.unobserve(this.elementRef.nativeElement);
        }
      }, {
        root: document
      }
    );
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.intersectionObserver.observe(this.elementRef.nativeElement);
    });
  }

  ngOnDestroy() {
    this.intersectionObserver.disconnect();
  }
}
