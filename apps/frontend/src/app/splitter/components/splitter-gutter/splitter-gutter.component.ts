import {
  Component, EventEmitter, HostListener, Input, Output
} from '@angular/core';

@Component({
  selector: 'studio-lite-splitter-gutter',
  templateUrl: './splitter-gutter.component.html',
  styleUrls: ['./splitter-gutter.component.scss']
})
export class SplitterGutterComponent {
  pointerPressed: boolean = false;
  @Input() index!: number;
  @Input() lineSize!: number;
  @Input() hotspotSize!: number;
  @Input() isFixed!: boolean;
  @Output() dragging = new EventEmitter<{ index: number, position: number }>();
  @Output() startDragging = new EventEmitter<number>();

  onPointerDown(event: PointerEvent) {
    if (!this.isFixed) {
      this.pointerPressed = true;
      this.startDragging.emit(this.index);
      event.preventDefault();
    }
  }

  @HostListener('document:pointermove', ['$event'])
  onGlobalPointerMove(event: PointerEvent) {
    if (this.pointerPressed) {
      this.dragging.emit({ index: this.index, position: event.clientX });
    }
  }

  @HostListener('document:pointerup')
  onGlobalPointerUp(): void {
    this.pointerPressed = false;
  }
}