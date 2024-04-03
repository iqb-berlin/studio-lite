import { Component, ElementRef, Input } from '@angular/core';

@Component({
  selector: 'studio-lite-splitter-pane',
  templateUrl: './splitter-pane.component.html',
  styleUrls: ['./splitter-pane.component.scss'],
  standalone: true
})
export class SplitterPaneComponent {
  size: number = 0;
  index: number = 0;
  isLast: boolean = false;
  @Input() initialSize: number | 'auto' = 'auto';
  @Input() minSize: number = 0;
  @Input() maxSize!: number;

  constructor(public elementRef: ElementRef) { }

  init(index: number, isLast: boolean): void {
    this.index = index;
    this.isLast = isLast;
    this.elementRef.nativeElement.style.order = index;
    if (this.initialSize !== 'auto') {
      this.setSize(this.initialSize);
    }
    if (this.initialSize !== 'auto' || this.isLast) {
      this.setStyle(this.size);
    }
  }

  setSize(size: number): void {
    let paneSize = size < this.minSize ? this.minSize : size;
    paneSize = this.maxSize && paneSize > this.maxSize ? this.maxSize : paneSize;
    this.size = paneSize;
  }

  calculateSize(isBeforeGutter: boolean, position: number, gutterOffset: number): void {
    const paneSize = isBeforeGutter ?
      position - this.elementRef.nativeElement.offsetLeft :
      (this.elementRef.nativeElement.offsetLeft + this.elementRef.nativeElement.offsetWidth) - position - gutterOffset;
    this.setSize(paneSize);
  }

  setStyle(paneSize: number): void {
    this.elementRef.nativeElement.style.flexShrink = this.isLast ? 1 : 0;
    this.elementRef.nativeElement.style.flexGrow = this.isLast ? 1 : 0;
    this.elementRef.nativeElement.style.flexBasis = this.isLast ? 'auto' : `${paneSize}px`;
  }
}
