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
    const targetSize = this.getTargetSize();
    if (targetSize > 0 || this.isLast) {
      this.size = this.applyConstraints(targetSize);
      this.setStyle(this.size);
    }
  }

  private getTargetSize(): number {
    const storedSize = this.splitterService.panelSizes[this.index];
    if (storedSize && !this.isLast) return storedSize;
    return this.initialSize === 'auto' ? 0 : this.initialSize;
  }

  private applyConstraints(targetSize: number): number {
    let constrainedSize = Math.max(targetSize, this.minSize);
    if (this.maxSize) {
      constrainedSize = Math.min(constrainedSize, this.maxSize);
    }
    return constrainedSize;
  }

  setStyle(paneSize: number): void {
    this.elementRef.nativeElement.style.flexShrink = this.isLast ? 1 : 0;
    this.elementRef.nativeElement.style.flexGrow = this.isLast ? 1 : 0;
    this.elementRef.nativeElement.style.flexBasis = this.isLast ? 'auto' : `${paneSize}px`;
  }
}
