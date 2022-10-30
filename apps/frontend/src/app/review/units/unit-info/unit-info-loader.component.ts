import {
  AfterViewInit,
  Component, ElementRef, EventEmitter, Input, OnDestroy, Output
} from '@angular/core';

@Component({
  selector: 'unit-info-loader',
  template: `
    <div id="unit_info_loader_div" [style.height]="spinnerOn ? '30px' : '0'">
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
  @Output() onEnter = new EventEmitter();
  intersectionObserver: IntersectionObserver;
  spinnerOn = false;
  isInView = false;
  @Input('loaderOn')
  set loaderOn(value: boolean) {
    this.spinnerOn = value;
  }

  constructor(
    private elementRef: ElementRef
  ) {
    this.intersectionObserver = new IntersectionObserver(
      (entries: IntersectionObserverEntry[]): void => {
        const intersectingEntries = entries.filter(e => e.isIntersecting);
        if (intersectingEntries && intersectingEntries.length > 0) {
          this.isInView = true;
          this.onEnter.emit();
        } else {
          this.isInView = false;
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
    this.intersectionObserver.unobserve(this.elementRef.nativeElement);
    this.intersectionObserver.disconnect();
  }
}
