import {
  AfterViewInit,
  Component, ElementRef, EventEmitter, Input, OnDestroy, Output
} from '@angular/core';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { NgIf } from '@angular/common';

@Component({
  selector: 'studio-lite-unit-info-loader',
  templateUrl: './unit-info-loader.component.html',
  styleUrls: ['./unit-info-loader.component.scss'],
  standalone: true,
  imports: [NgIf, MatProgressSpinner]
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
