import {
  Component, EventEmitter, Input, OnInit, Output, HostBinding
} from '@angular/core';
import {
  HttpClient, HttpEventType, HttpHeaders, HttpParams,
  HttpErrorResponse, HttpEvent
} from '@angular/common/http';
import { UploadStatus } from '../iqb-files-classes';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'iqb-files-upload',
  templateUrl: './iqbFilesUpload.component.html',
  exportAs: 'iqbFilesUpload',
  styleUrls: ['./../iqb-files.scss']
})

export class IqbFilesUploadComponent implements OnInit {
  @HostBinding('class') myclass = 'iqb-files-upload';

  constructor(
    private myHttpClient: HttpClient
  ) { }

  // ''''''''''''''''''''''''
  private _status: UploadStatus | undefined;
  get status(): UploadStatus {
    return <UploadStatus>this._status;
  }

  set status(newstatus: UploadStatus) {
    this._status = newstatus;
    this.statusChangedEvent.emit(this);
  }

  // ''''''''''''''''''''''''
  private requestResponseText: string | undefined;
  get statustext(): string {
    let myreturn = this.requestResponseText;
    // eslint-disable-next-line default-case
    switch (this._status) {
      case UploadStatus.busy: {
        myreturn = 'Bitte warten';
        break;
      }
      case UploadStatus.ready: {
        myreturn = 'Bereit';
        break;
      }
    }
    return <string>myreturn;
  }

  /* Http request input bindings */
  @Input()
  httpUrl: string | undefined = 'http://localhost:8080';

  @Input()
  httpRequestHeaders: HttpHeaders | {
    [header: string]: string | string[];
  } = new HttpHeaders().set('Content-Type', 'multipart/form-data');

  @Input()
  httpRequestParams: HttpParams | {
    [param: string]: string | string[];
  } = new HttpParams();

  @Input()
  fileAlias: string | undefined = 'file';

  @Input()
  tokenName: string | undefined = '';

  @Input()
  token: string | undefined = '';

  @Input()
  folderName: string | undefined = '';

  @Input()
  folder: string | undefined = '';

  @Input()
  get file(): any {
    return this._file;
  }

  set file(file: any) {
    this._file = file;
    this._filedate = this._file.lastModified;
    this.total = this._file.size;
  }

  @Input()
  set id(id: number) {
    this._id = id;
  }

  get id(): number {
    return <number>this._id;
  }

  @Output() removeFileRequestEvent = new EventEmitter<IqbFilesUploadComponent>();
  @Output() statusChangedEvent = new EventEmitter<IqbFilesUploadComponent>();

  progressPercentage = 0;
  loaded = 0;
  private total = 0;
  private _file: any;
  private _filedate = '';
  private _id: number | undefined;
  private fileUploadSubscription: any;

  ngOnInit() {
    this._status = UploadStatus.ready;
    this.requestResponseText = '';
    this.upload();
  }

  // ==================================================================
  upload(): void {
    if (this.status === UploadStatus.ready && this.fileAlias) {
      this.status = UploadStatus.busy;
      const formData = new FormData();
      formData.set(this.fileAlias, this._file, this._file.name);
      if ((typeof this.tokenName !== 'undefined') && (typeof this.token !== 'undefined')) {
        if (this.tokenName.length > 0) {
          formData.append(this.tokenName, this.token);
        }
      }
      if ((typeof this.folderName !== 'undefined') && (typeof this.folder !== 'undefined')) {
        if (this.folderName.length > 0) {
          formData.append(this.folderName, this.folder);
        }
      }
      if (this.httpUrl) {
        this.fileUploadSubscription = this.myHttpClient.post(this.httpUrl, formData, {
          // headers: this.httpRequestHeaders,
          observe: 'events',
          params: this.httpRequestParams,
          reportProgress: true,
          responseType: 'json'
        }).subscribe((event: HttpEvent<any>) => {
          if (event.type === HttpEventType.UploadProgress) {
            // eslint-disable-next-line no-mixed-operators
            this.progressPercentage = event.total ? Math.floor(event.loaded * 100 / event.total) : 0;
            this.loaded = event.loaded;
            this.total = event.total ? event.total : 0;
            this.status = UploadStatus.busy;
          } else if (event.type === HttpEventType.Response) {
            this.requestResponseText = event.body;
            if (this.requestResponseText && (this.requestResponseText.length > 5) && (this.requestResponseText.substr(0, 2) === 'e:')) {
              this.requestResponseText = this.requestResponseText.substr(2);
              this.status = UploadStatus.error;
            } else {
              this.status = UploadStatus.ok;
              this.remove();
            }
          }
        }, (errorObj: HttpErrorResponse) => {
          if (this.fileUploadSubscription) {
            this.fileUploadSubscription.unsubscribe();
          }

          this.status = UploadStatus.error;
          if (errorObj.status === 401) {
            this.requestResponseText = 'Fehler: Zugriff verweigert - bitte (neu) anmelden!';
          } else if (errorObj.status === 503) {
            this.requestResponseText = 'Fehler: Server meldet Problem mit Datenbank oder Datei zu groß.';
          } else if (errorObj.error instanceof ErrorEvent) {
            this.requestResponseText = `Fehler: ${(<ErrorEvent>errorObj.error).message}`;
          } else {
            this.requestResponseText = `Fehler: ${errorObj.message}`;
          }
        })
      }
    }
  }

  // ==================================================================
  remove(): void {
    if (this.fileUploadSubscription) {
      this.fileUploadSubscription.unsubscribe();
    }
    this.removeFileRequestEvent.emit(this);
  }
}
