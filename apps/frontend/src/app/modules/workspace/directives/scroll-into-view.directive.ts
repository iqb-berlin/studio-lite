import {
  Directive, ElementRef, Input, OnChanges, SimpleChanges
} from '@angular/core';

@Directive({
  selector: '[studioLiteScrollIntoView]',
  standalone: true
})
export class ScrollIntoViewDirective implements OnChanges {
  @Input() selectedUnitId!: number;
  @Input() rowId!: number;

  constructor(private elementRef: ElementRef<HTMLElement>) {}

  scrollIntoView(): void {
    const nativeElement = this.elementRef.nativeElement;
    if (!nativeElement || typeof nativeElement.scrollIntoView !== 'function') {
      return;
    }

    setTimeout(() => {
      nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 0);
  }

  ngOnChanges(changes: SimpleChanges): void {
    const selectedUnitId = 'selectedUnitId';
    if (changes[selectedUnitId] && changes[selectedUnitId].currentValue === this.rowId) {
      this.scrollIntoView();
    }
  }
}
