import {
  Component, HostListener, Inject, Input, OnChanges, OnDestroy, OnInit
} from '@angular/core';
import { Subscription } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BackendService } from '../../backend.service';
import { AppService } from '../../../app.service';
import { WorkspaceService } from '../../workspace.service';

declare let srcDoc: any;

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'app-unit-editor',
  templateUrl: './unit-editor.component.html',
  styleUrls: ['./unit-editor.component.css']
})
export class UnitEditorComponent implements OnInit, OnDestroy, OnChanges {
  @Input() unitId!: number | null;
  @Input() editorId = '';
  private readonly postMessageSubscription: Subscription;
  private iFrameHostElement: HTMLElement | undefined;
  private iFrameElement: HTMLElement | undefined;
  private postMessageTarget: Window | undefined;
  private sessionId = '';
  private lastEditorId = '';
  editorApiVersion = 1;

  constructor(
    @Inject('SERVER_URL') private serverUrl: string,
    private bs: BackendService,
    private ds: WorkspaceService,
    private snackBar: MatSnackBar,
    private mds: AppService
  ) {
    this.postMessageSubscription = this.mds.postMessage$.subscribe((m: MessageEvent) => {
      const msgData = m.data;
      const msgType = msgData.type;

      if ((msgType !== undefined) && (msgType !== null)) {
        this.postMessageTarget = m.source as Window;
        switch (msgType) {
          case 'voeReadyNotification':
          case 'vo.FromAuthoringModule.ReadyNotification':
            if (msgType === 'voeReadyNotification') {
              const majorVersion = msgData.apiVersion.match(/\d+/);
              if (majorVersion.length > 0) {
                const majorVersionNumber = Number(majorVersion[0]);
                this.editorApiVersion = majorVersionNumber > 2 ? 3 : 2;
              } else {
                this.editorApiVersion = 2;
              }
            } else {
              this.editorApiVersion = 1;
            }
            this.sessionId = Math.floor(Math.random() * 20000000 + 10000000).toString();
            this.postMessageTarget = m.source as Window;
            this.sendUnitDataToEditor();
            break;

          case 'voeDefinitionChangedNotification':
          case 'vo.FromAuthoringModule.ChangedNotification':
            if (msgData.sessionId === this.sessionId) {
              if (this.editorApiVersion > 1) {
                if (msgData.unitDefinition) {
                  this.ds.unitDefinitionNew = msgData.unitDefinition;
                  this.ds.setUnitDataChanged();
                } else {
                  this.postMessageTarget.postMessage({
                    type: 'voeGetDefinitionRequest',
                    sessionId: this.sessionId
                  }, '*');
                }
              } else {
                this.postMessageTarget.postMessage({
                  type: 'vo.ToAuthoringModule.DataRequest',
                  sessionId: this.sessionId
                }, '*');
              }
            }
            break;

          case 'vo.FromAuthoringModule.DataTransfer':
            if (msgData.sessionId === this.sessionId) {
              this.ds.unitDefinitionNew = msgData.unitDefinition;
              this.ds.setUnitDataChanged();
            }
            break;

          default:
            console.log(`processMessagePost ignored message: ${msgType}`);
            break;
        }
      }
    });
  }

  sendUnitDataToEditor(): void {
    if (this.unitId && this.unitId > 0) {
      const editorValidation = WorkspaceService.validModuleId(this.editorId, this.ds.editorList);
      if (editorValidation === false) {
        this.buildEditor(this.editorId); // creates error message
      } else {
        if (editorValidation !== true) this.editorId = editorValidation;
        if ((this.editorId === this.lastEditorId) && this.postMessageTarget) {
          if (this.ds.unitDefinitionNew) {
            this.postUnitDef(this.ds.unitDefinitionNew);
          } else {
            this.bs.getUnitDefinition(this.ds.selectedWorkspace, this.unitId).subscribe(
              ued => {
                this.ds.unitDefinitionNew = ued;
                this.ds.unitDefinitionOld = ued;
                this.postUnitDef(this.ds.unitDefinitionNew);
              },
              err => {
                this.snackBar.open(`Konnte Aufgabendefinition nicht laden (${err.code})`, 'Fehler', { duration: 3000 });
              }
            );
          }
        } else {
          this.buildEditor(this.editorId);
          // editor gets unit data via ReadyNotification
        }
      }
    } else {
      this.buildEditor('');
    }
  }

  private postUnitDef(unitDef: string): void {
    if (this.postMessageTarget) {
      if (this.editorApiVersion === 1) {
        this.postMessageTarget.postMessage({
          type: 'vo.ToAuthoringModule.DataTransfer',
          sessionId: this.sessionId,
          unitDefinition: unitDef
        }, '*');
      } else {
        this.postMessageTarget.postMessage({
          type: 'voeStartCommand',
          sessionId: this.sessionId,
          editorConfig: {
            definitionReportPolicy: 'eager'
          },
          unitDefinition: unitDef
        }, '*');
      }
    }
  }

  private buildEditor(editorId: string) {
    this.iFrameElement = undefined;
    this.postMessageTarget = undefined;
    if (this.iFrameHostElement) {
      while (this.iFrameHostElement.lastChild) {
        this.iFrameHostElement.removeChild(this.iFrameHostElement.lastChild);
      }
      if (editorId && this.ds.editorList && this.ds.editorList[editorId]) {
        const editorData = this.ds.editorList[editorId];
        if (editorData.html) {
          this.setupEditorIFrame(editorData.html);
          this.lastEditorId = editorId;
        } else {
          this.bs.getModuleHtml(editorId).subscribe(
            editorResponse => {
              editorData.html = editorResponse;
              this.setupEditorIFrame(editorResponse);
              this.lastEditorId = editorId;
            },
            () => {
              // if (this.iFrameHostElement) {
              // todo reactivate?
               //   UnitComponent.getMessageElement(`Für Editor "${editorData.label}" konnte kein Modul geladen werden.`)
               // );
             // }
              // this.lastEditorId = '';
            }
          );
        }
      } else {
//        this.iFrameHostElement.appendChild(
 //         UnitComponent.getMessageElement(
   //         editorId ? `Editor-Modul "${editorId}" nicht in Datenbank` : 'Kein Editor festgelegt.'
     //     )
       // );
        // todo reactivate?
        // this.lastEditorId = '';
      }
    }
  }

  private setupEditorIFrame(editorHtml: string): void {
    if (this.iFrameHostElement) {
      this.iFrameElement = <HTMLIFrameElement>document.createElement('iframe');
      this.iFrameElement.setAttribute('sandbox', 'allow-forms allow-scripts allow-same-origin');
      this.iFrameElement.setAttribute('class', 'unitHost');
      this.iFrameElement.setAttribute('height', String(this.iFrameHostElement.clientHeight - 5));
      this.iFrameHostElement.appendChild(this.iFrameElement);
      srcDoc.set(this.iFrameElement, editorHtml);
    }
  }

  ngOnInit(): void {
    this.iFrameHostElement = <HTMLElement>document.querySelector('#iFrameHostEditor');
    if (this.unitId && this.unitId > 0) this.sendUnitDataToEditor();
  }

  ngOnChanges(): void {
    if (this.iFrameHostElement) this.sendUnitDataToEditor();
  }

  @HostListener('window:resize')
  onResize(): void {
    if (this.iFrameElement && this.iFrameHostElement) {
      const divHeight = this.iFrameHostElement.clientHeight;
      this.iFrameElement.setAttribute('height', String(divHeight - 5));
      // TODO: Why minus 5px?
    }
  }

  ngOnDestroy(): void {
    if (this.postMessageSubscription !== null) this.postMessageSubscription.unsubscribe();
  }
}
