import {
  Component, HostListener, OnDestroy, OnInit
} from '@angular/core';
import { Subscription } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UnitMetadataDto } from '@studio-lite-lib/api-dto';
import { BackendService } from '../../backend.service';
import { AppService } from '../../../app.service';
import { WorkspaceService } from '../../workspace.service';
import { UnitDefinitionStore, UnitMetadataStore } from '../../workspace.classes';

@Component({
  template: `
    <div *ngIf="message" style="margin: 30px">{{message}}</div>
    <div id="iFrameHostEditor">
      <iframe id="hosting-iframe" class="unitHost"></iframe>
    </div>`,
  styles: ['#iFrameHostEditor {height: calc(100% - 49px);}']
})
export class UnitEditorComponent implements OnInit, OnDestroy {
  private readonly postMessageSubscription: Subscription;
  private unitIdChangedSubscription: Subscription | undefined;
  private iFrameElement: HTMLIFrameElement | undefined;
  private postMessageTarget: Window | undefined;
  private sessionId = '';
  private lastEditorId = '';
  editorApiVersion = 1;
  message = '';

  constructor(
    private backendService: BackendService,
    private workspaceService: WorkspaceService,
    private snackBar: MatSnackBar,
    private appService: AppService
  ) {
    this.postMessageSubscription = this.appService.postMessage$.subscribe((m: MessageEvent) => {
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
                  this.workspaceService.unitDefinitionStore?.setData(msgData.variables, msgData.unitDefinition);
                // } else { TODO: find solution for voeGetDefinitionRequest
                //   this.postMessageTarget.postMessage({
                //     type: 'voeGetDefinitionRequest',
                //     sessionId: this.sessionId
                //   }, '*');
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
              this.workspaceService.unitDefinitionStore?.setData(msgData.variables, msgData.unitDefinition);
            }
            break;

          default:
            // eslint-disable-next-line no-console
            console.warn(`processMessagePost ignored message: ${msgType}`);
            break;
        }
      }
    });
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.iFrameElement = <HTMLIFrameElement>document.querySelector('#hosting-iframe');
      this.unitIdChangedSubscription = this.workspaceService.selectedUnit$.subscribe(() => {
        this.message = '';
        if (this.workspaceService.unitMetadataStore) {
          this.sendUnitDataToEditor();
        } else {
          const selectedUnitId = this.workspaceService.selectedUnit$.getValue();
          this.backendService.getUnitMetadata(this.workspaceService.selectedWorkspace,
            selectedUnitId).subscribe(unitData => {
            this.workspaceService.unitMetadataStore = new UnitMetadataStore(
              unitData || <UnitMetadataDto>{ id: selectedUnitId }
            );
            this.sendUnitDataToEditor();
          });
        }
      });
    });
  }

  sendUnitDataToEditor(): void {
    const unitId = this.workspaceService.selectedUnit$.getValue();
    if (unitId && unitId > 0 && this.workspaceService.unitMetadataStore) {
      const unitMetadata = this.workspaceService.unitMetadataStore.getData();
      const editorId = unitMetadata.editor ? this.workspaceService.editorList.getBestMatch(unitMetadata.editor) : '';
      if (editorId) {
        if ((editorId === this.lastEditorId) && this.postMessageTarget) {
          if (this.workspaceService.unitDefinitionStore) {
            this.postUnitDef(this.workspaceService.unitDefinitionStore);
          } else {
            this.backendService.getUnitDefinition(this.workspaceService.selectedWorkspace, unitId).subscribe(
              ued => {
                if (ued) {
                  this.workspaceService.unitDefinitionStore = new UnitDefinitionStore(unitId, ued);
                  this.postUnitDef(this.workspaceService.unitDefinitionStore);
                } else {
                  this.snackBar.open('Konnte Aufgabendefinition nicht laden', 'Fehler', { duration: 3000 });
                }
              }
            );
          }
        } else {
          this.buildEditor(editorId);
          // editor gets unit data via ReadyNotification
        }
      } else {
        this.message = 'Kein gültiger Editor zugewiesen. Bitte gehen Sie zu "Eigenschaften".';
        this.buildEditor();
      }
    } else {
      this.message = 'Aufgabe nicht gefunden oder Daten fehlerhaft.';
      this.buildEditor();
    }
  }

  private postUnitDef(unitDefinitionStore: UnitDefinitionStore): void {
    const unitDef = unitDefinitionStore.getData();
    if (this.postMessageTarget) {
      if (this.editorApiVersion === 1) {
        this.postMessageTarget.postMessage({
          type: 'vo.ToAuthoringModule.DataTransfer',
          sessionId: this.sessionId,
          unitDefinition: unitDef.definition ? unitDef.definition : ''
        }, '*');
      } else {
        this.postMessageTarget.postMessage({
          type: 'voeStartCommand',
          sessionId: this.sessionId,
          editorConfig: {
            definitionReportPolicy: 'eager'
          },
          unitDefinition: unitDef.definition ? unitDef.definition : ''
        }, '*');
      }
    }
  }

  private buildEditor(editorId?: string) {
    this.postMessageTarget = undefined;
    if (this.iFrameElement) {
      this.iFrameElement.srcdoc = '';
      if (editorId) {
        this.workspaceService.getModuleHtml(editorId).then(editorData => {
          if (editorData) {
            this.setupEditorIFrame(editorData);
            this.lastEditorId = editorId;
          } else {
            this.message = `Der Editor "${editorId}" konnte nicht geladen werden.`;
            this.lastEditorId = '';
          }
        });
      } else {
        this.lastEditorId = '';
      }
    }
  }

  private setupEditorIFrame(editorHtml: string): void {
    if (this.iFrameElement && this.iFrameElement.parentElement) {
      const divHeight = this.iFrameElement.parentElement.clientHeight;
      this.iFrameElement.height = `${String(divHeight - 5)}px`;
      this.iFrameElement.srcdoc = editorHtml;
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    if (this.iFrameElement && this.iFrameElement.parentElement) {
      const divHeight = this.iFrameElement.parentElement.clientHeight;
      this.iFrameElement.height = `${String(divHeight - 5)}px`;
    }
  }

  ngOnDestroy(): void {
    if (this.postMessageSubscription !== null) this.postMessageSubscription.unsubscribe();
  }
}
