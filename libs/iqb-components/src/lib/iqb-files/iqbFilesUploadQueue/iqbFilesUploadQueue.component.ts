import {
  Component, EventEmitter, OnDestroy, QueryList, ViewChildren, Input, Output
} from '@angular/core';
import { HttpHeaders, HttpParams } from '@angular/common/http';
import { MatButton } from '@angular/material/button';
import { IqbFilesUploadComponent } from '../iqbFilesUpload/iqbFilesUpload.component';
import { UploadStatus } from '../iqb-files-classes';

/**
 * A material design file upload queue component.
 */
@Component({
  selector: 'iqb-files-upload-queue',
  templateUrl: 'iqbFilesUploadQueue.component.html',
  exportAs: 'iqbFilesUploadQueue',
  imports: [IqbFilesUploadComponent, MatButton]
})
export class IqbFilesUploadQueueComponent implements OnDestroy {
  @ViewChildren(IqbFilesUploadComponent) fileUploads: QueryList<IqbFilesUploadComponent> | undefined;

  files: Array<File> = [];
  disableClearButton = true;

  /* Http request input bindings */
  @Input()
    httpUrl: string | undefined;

  @Input()
    httpRequestHeaders: HttpHeaders | {
    [header: string]: string | string[];
  } = new HttpHeaders().set('Content-Type', 'multipart/form-data');

  @Input()
    httpRequestParams: HttpParams | {
    [param: string]: string | string[];
  } = new HttpParams();

  @Input()
    fileAlias: string | undefined;

  @Input()
    tokenName: string | undefined;

  @Input()
    token: string | undefined;

  @Input()
    folderName: string | undefined;

  @Input()
    folder: string | undefined;

  @Output() uploadCompleteEvent = new EventEmitter<IqbFilesUploadQueueComponent>();

  // +++++++++++++++++++++++++++++++++++++++++++++++++
  add(file: File) {
    this.files.push(file);
  }

  // +++++++++++++++++++++++++++++++++++++++++++++++++
  removeAll() {
    this.files.splice(0, this.files.length);
  }

  // +++++++++++++++++++++++++++++++++++++++++++++++++
  ngOnDestroy() {
    if (this.files) {
      this.removeAll();
    }
  }

  // +++++++++++++++++++++++++++++++++++++++++++++++++
  removeFile(fileToRemove: IqbFilesUploadComponent) {
    this.files.splice(fileToRemove.id, 1);
  }

  /*    // +++++++++++++++++++++++++++++++++++++++++++++++++
    updateStatus() {
      this.numberOfErrors = 0;
      this.numberOfUploads = 0;

      this.fileUploads.forEach((fileUpload) => {

        fileUpload.upload();
      });
    } */

  // +++++++++++++++++++++++++++++++++++++++++++++++++
  analyseStatus() {
    let someoneiscomplete = false;
    let someoneisbusy = false;
    if (this.fileUploads) {
      this.fileUploads.forEach(fileUpload => {
        if ((fileUpload.status === UploadStatus.ok) || (fileUpload.status === UploadStatus.error)) {
          someoneiscomplete = true;
        } else if (fileUpload.status === UploadStatus.busy) {
          someoneisbusy = true;
          // forEach
        }
      });
    }
    if (someoneiscomplete && !someoneisbusy) {
      this.uploadCompleteEvent.emit();
      this.disableClearButton = false;
    }
  }
}
