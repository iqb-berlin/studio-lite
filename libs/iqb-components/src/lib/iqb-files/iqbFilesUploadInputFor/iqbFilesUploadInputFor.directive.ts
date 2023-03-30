import {
  Directive, ElementRef, HostListener, Input
} from '@angular/core';
import { IqbFilesUploadQueueComponent } from '@studio-lite-lib/iqb-components';

@Directive({
  selector: 'input[iqbFilesUploadInputFor], div[iqbFilesUploadInputFor]'
})
export class IqbFilesUploadInputForDirective {
  private _queue!: IqbFilesUploadQueueComponent;
  private _element: HTMLElement;

  // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  constructor(private element: ElementRef) {
    this._element = this.element.nativeElement;
  }

  @Input()
  set iqbFilesUploadInputFor(value: IqbFilesUploadQueueComponent) {
    if (value) {
      this._queue = value;
    }
  }

  // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  @HostListener('change')
  onChange(): void {
    const files = this.element.nativeElement.files;
    // this.onFileSelected.emit(files);

    for (let i = 0; i < files.length; i++) {
      this._queue.add(files[i]);
    }
    this.element.nativeElement.value = '';
  }
}
