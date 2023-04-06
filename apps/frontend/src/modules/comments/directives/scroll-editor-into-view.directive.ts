import {
  Directive, ElementRef, Input, OnInit
} from '@angular/core';

@Directive({
  selector: '[studioLiteScrollEditorIntoView]'
})
export class ScrollEditorIntoViewDirective implements OnInit {
  @Input() isVisible!: boolean;

  constructor(private elementRef: ElementRef) {}

  ngOnInit(): void {
    if (this.isVisible) {
      setTimeout(() => this.elementRef.nativeElement
        .scrollIntoView({ behavior: 'smooth', block: 'center' }));
    }
  }
}
