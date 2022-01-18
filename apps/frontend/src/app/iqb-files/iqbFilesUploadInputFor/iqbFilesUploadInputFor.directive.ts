import { Component, Directive, ElementRef, EventEmitter, HostListener,
    Input, OnDestroy, OnInit, Output } from '@angular/core';


  @Directive({
    // eslint-disable-next-line @angular-eslint/directive-selector
    selector: 'input[iqbFilesUploadInputFor], div[iqbFilesUploadInputFor]',
  })
  export class IqbFilesUploadInputForDirective  {


    private _queue: any = null;
    private _element: HTMLElement;

    // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    constructor(private element: ElementRef) {
        this._element = this.element.nativeElement;
    }


    @Input('iqbFilesUploadInputFor')
    set filesUploadQueue(value: any) {
        if (value) {
            this._queue = value;
        }
    }

    // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    @HostListener('change')
    public onChange(): any {
      const files = this.element.nativeElement.files;
      // this.onFileSelected.emit(files);

      for (let i = 0; i < files.length; i++) {
        this._queue.add(files[i]);
      }
      this.element.nativeElement.value = '';
    }

    // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    @HostListener('drop', [ '$event' ])
    public onDrop(event: any): any {
      const files = event.dataTransfer.files;
      // this.onFileSelected.emit(files);

      for (let i = 0; i < files.length; i++) {
        this._queue.add(files[i]);
      }
      event.preventDefault();
      event.stopPropagation();
      this.element.nativeElement.value = '';
    }

    // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    @HostListener('dragover', [ '$event' ])
    public onDropOver(event: any): any {
      event.preventDefault();
    }

  }
