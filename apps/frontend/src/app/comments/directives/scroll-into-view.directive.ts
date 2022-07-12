import { Directive, ElementRef, Input } from '@angular/core';
import { Subject } from 'rxjs';

@Directive({
  selector: '[studioLiteScrollIntoView]'
})
export class ScrollIntoViewDirective {
  @Input() scrollTargetId!: Subject<number>;
  @Input() id!: number;

  constructor(private elementRef: ElementRef) {}

  ngOnInit(): void {
    this.scrollTargetId.subscribe((newId: number): void => {
      if (newId === this.id) {
        this.elementRef.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  }
}
