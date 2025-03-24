import { Component, ElementRef, Input } from '@angular/core';
import { SplitterService } from '../../services/splitter.service';

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

  constructor(public elementRef: ElementRef, private splitterService: SplitterService) {
  }

  init(index: number, isLast: boolean): void {
    this.index = index;
    this.isLast = isLast;
    this.elementRef.nativeElement.style.order = index;
    this.initSize();
  }

  private initSize(): void {
    const storedSize = this.splitterService.panelSizes[this.index];
    if (storedSize && !this.isLast) {
      this.setSize(storedSize);
    } else if (this.initialSize !== 'auto') {
      this.setSize(this.initialSize);
    }
    if (this.initialSize !== 'auto' || (storedSize && !this.isLast) || this.isLast) {
      this.setStyle(this.size);
    }
  }

  private setSize(size: number): void {
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
