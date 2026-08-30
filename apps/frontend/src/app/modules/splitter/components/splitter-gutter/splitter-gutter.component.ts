import {
  Component, EventEmitter, HostListener, Input, Output
} from '@angular/core';

/**
 * The draggable divider between two panes. The line drawn and the area that reacts to the pointer
 * are sized separately, so a thin line can still be easy to catch.
 */
@Component({
  selector: 'studio-lite-splitter-gutter',
  templateUrl: './splitter-gutter.component.html',
  styleUrls: ['./splitter-gutter.component.scss'],
  standalone: true
})
export class SplitterGutterComponent {
  pointerPressed: boolean = false;
  @Input() index!: number;
  @Input() lineSize!: number;
  @Input() hotspotSize!: number;
  @Input() isFixed!: boolean;
  @Output() dragging = new EventEmitter<{ index: number, position: number }>();
  @Output() startDragging = new EventEmitter<number>();
  @Output() stopDragging = new EventEmitter<number>();

  onPointerDown(event: PointerEvent) {
    if (!this.isFixed) {
      this.pointerPressed = true;
      if (event.target instanceof HTMLElement) {
        event.target.setPointerCapture(event.pointerId);
      }
      this.startDragging.emit(this.index);
    }
  }

  @HostListener('window:pointermove', ['$event'])
  onGlobalPointerMove(event: PointerEvent) {
    if (this.pointerPressed) {
      this.dragging.emit({ index: this.index, position: event.clientX });
    }
  }

  @HostListener('window:pointerup', ['$event'])
  @HostListener('window:pointercancel', ['$event'])
  onGlobalPointerUp(event: PointerEvent): void {
    if (this.pointerPressed) {
      this.pointerPressed = false;
      if (event.target instanceof HTMLElement) {
        try {
          event.target.releasePointerCapture(event.pointerId);
        } catch {
          // Ignore if pointer capture was already released or invalid
        }
      }
      this.stopDragging.emit(this.index);
    }
  }
}
