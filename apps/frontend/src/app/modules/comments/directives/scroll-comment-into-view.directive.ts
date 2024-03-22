import {
  Directive, ElementRef, Input, OnDestroy, OnInit
} from '@angular/core';
import { Subject, takeUntil } from 'rxjs';

@Directive({
    selector: '[studioLiteScrollCommentIntoView]',
    standalone: true
})
export class ScrollCommentIntoViewDirective implements OnInit, OnDestroy {
  @Input() scrollTargetId!: Subject<number>;
  @Input() id!: number;

  private ngUnsubscribe = new Subject<void>();

  constructor(private elementRef: ElementRef) {}

  ngOnInit(): void {
    this.scrollTargetId
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((newId: number): void => {
        if (newId === this.id) {
          this.elementRef.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
