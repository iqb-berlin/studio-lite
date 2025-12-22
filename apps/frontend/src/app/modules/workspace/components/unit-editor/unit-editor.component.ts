import {
  AfterViewInit, Component, ElementRef, OnDestroy, ViewChild
} from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { VeronaModuleFactory } from '@studio-lite/shared-code';
import { TranslateService } from '@ngx-translate/core';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { ModuleService } from '../../../shared/services/module.service';
import { WorkspaceBackendService } from '../../services/workspace-backend.service';
import { AppService } from '../../../../services/app.service';
import { WorkspaceService } from '../../services/workspace.service';
import { UnitDefinitionStore } from '../../classes/unit-definition-store';
import { RolePipe } from '../../pipes/role.pipe';

@Component({
  selector: 'studio-lite-unit-editor',
  templateUrl: './unit-editor.component.html',
  styleUrls: ['./unit-editor.component.scss'],
  host: { class: 'unit-editor' },
  imports: [
    MatProgressSpinner
  ]
})
export class UnitEditorComponent implements AfterViewInit, OnDestroy {
  @ViewChild('hostingIframe') hostingIframe!: ElementRef;
  protected iFrameElement: HTMLIFrameElement | undefined;
  private postMessageTarget: Window | undefined;
  private sessionId = '';
  private lastEditorId = '';
  private ngUnsubscribe = new Subject<void>();
  editorApiVersion = 1;
  message = '';
  unitLoaded = true;

  constructor(
    private backendService: WorkspaceBackendService,
    private workspaceService: WorkspaceService,
    private snackBar: MatSnackBar,
    private moduleService: ModuleService,
    private appService: AppService,
    private translateService: TranslateService
  ) {

  }

  ngAfterViewInit(): void {
    this.iFrameElement = this.hostingIframe.nativeElement;
    this.subscribeForMessages();
    this.subscribeForWorkspaceChange();
  }

  subscribeForWorkspaceChange(): void {
    this.workspaceService.selectedUnit$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        if (this.unitLoaded) {
          this.unitLoaded = false;
          this.message = '';
          this.workspaceService
            .loadUnitProperties()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(() => this.sendUnitDataToEditor());
        } else {
          this.ngUnsubscribe.next();
          this.ngUnsubscribe.complete();
          this.ngUnsubscribe = new Subject<void>();
          this.unitLoaded = true;
          this.subscribeForMessages();
          this.subscribeForWorkspaceChange();
        }
      });
  }

  private subscribeForMessages(): void {
    this.appService.postMessage$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((m: MessageEvent) => {
        const msgData = m.data;
        const msgType = msgData.type;
        if (
          msgType !== undefined &&
          msgType !== null &&
          m.source === this.iFrameElement?.contentWindow
        ) {
          this.postMessageTarget = m.source as Window;
          switch (msgType) {
            case 'voeReadyNotification':
            case 'vo.FromAuthoringModule.ReadyNotification':
              if (msgType === 'voeReadyNotification') {
                const majorVersion = msgData.metadata ?
                  msgData.metadata.specVersion.match(/\d+/) :
                  msgData.apiVersion.match(/\d+/);
                if (majorVersion.length > 0) {
                  const majorVersionNumber = Number(majorVersion[0]);
                  this.editorApiVersion =
                    majorVersionNumber < 3 ? 2 : majorVersionNumber;
                } else {
                  this.editorApiVersion = 2;
                }
              } else {
                this.editorApiVersion = 1;
              }
              this.sessionId = Math.floor(
                Math.random() * 20000000 + 10000000
              ).toString();
              this.sendUnitDefinition(
                this.workspaceService.selectedUnit$.getValue(),
                this.workspaceService.getUnitDefinitionStore()
              );
              break;

            case 'voeDefinitionChangedNotification':
            case 'vo.FromAuthoringModule.ChangedNotification':
              if (msgData.sessionId === this.sessionId) {
                if (this.editorApiVersion > 1) {
                  if (msgData.unitDefinition) {
                    this.workspaceService
                      .getUnitDefinitionStore()
                      ?.setData(msgData.variables, msgData.unitDefinition);
                    // } else { TODO: find solution for voeGetDefinitionRequest
                    //   this.postMessageTarget.postMessage({
                    //     type: 'voeGetDefinitionRequest',
                    //     sessionId: this.sessionId
                    //   }, '*');
                  }
                } else {
                  this.postMessageTarget.postMessage(
                    {
                      type: 'vo.ToAuthoringModule.DataRequest',
                      sessionId: this.sessionId
                    },
                    '*'
                  );
                }
              }
              break;

            case 'vo.FromAuthoringModule.DataTransfer':
              if (msgData.sessionId === this.sessionId) {
                this.workspaceService
                  .getUnitDefinitionStore()
                  ?.setData(msgData.variables, msgData.unitDefinition);
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

  sendUnitDefinition(unitId: number, unitDefinitionStore: UnitDefinitionStore | undefined): void {
    if (!unitId) {
      this.message = this.translateService.instant('workspace.unit-not-found');
      this.postMessageTarget = undefined;
      return;
    }
    if (unitId && unitDefinitionStore) {
      this.postUnitDef(unitDefinitionStore);
    } else {
      this.backendService
        .getUnitDefinition(
          this.workspaceService.selectedWorkspaceId,
          unitId
        )
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(unitDefinitionDto => {
          if (unitDefinitionDto) {
            const newUnitDefinitionStore = new UnitDefinitionStore(
              unitId,
              unitDefinitionDto
            );
            this.workspaceService.setUnitDefinitionStore(
              newUnitDefinitionStore
            );
            this.postUnitDef(newUnitDefinitionStore);
          } else {
            this.snackBar.open(
              this.translateService.instant(
                'workspace.unit-definition-not-loaded'
              ),
              this.translateService.instant('workspace.error'),
              { duration: 3000 }
            );
          }
        });
    }
  }

  async getEditorId(): Promise<string> {
    const unitId = this.workspaceService.selectedUnit$.getValue();
    const unitMetadataStore = this.workspaceService.getUnitMetadataStore();
    if (unitId && unitMetadataStore) {
      const unitMetadata = unitMetadataStore.getData();
      if (Object.keys(this.moduleService.editors).length === 0) {
        await this.moduleService.loadList();
      }
      const editorId = unitMetadata.editor ?
        VeronaModuleFactory.getBestMatch(
          unitMetadata.editor,
          Object.keys(this.moduleService.editors)
        ) :
        '';
      return Promise.resolve(editorId);
    }
    return Promise.resolve('');
  }

  async sendUnitDataToEditor() {
    const editorId = await this.getEditorId();
    if (editorId) {
      if (editorId === this.lastEditorId && this.postMessageTarget) {
        this.sendUnitDefinition(
          this.workspaceService.selectedUnit$.getValue(),
          this.workspaceService.getUnitDefinitionStore()
        );
      } else {
        this.postMessageTarget = undefined;
        this.buildEditor(editorId);
        // editor gets unit data via ReadyNotification
      }
    } else {
      this.message = this.translateService.instant('workspace.no-editor');
      this.postMessageTarget = undefined;
    }
  }

  private postUnitDef(unitDefinitionStore: UnitDefinitionStore): void {
    const unitDef = unitDefinitionStore.getData();
    if (this.postMessageTarget) {
      if (this.editorApiVersion === 1) {
        this.postMessageTarget.postMessage(
          {
            type: 'vo.ToAuthoringModule.DataTransfer',
            sessionId: this.sessionId,
            unitDefinition: unitDef.definition ? unitDef.definition : ''
          },
          '*'
        );
      } else {
        this.postMessageTarget.postMessage(
          {
            type: 'voeStartCommand',
            sessionId: this.sessionId,
            editorConfig: {
              definitionReportPolicy: 'eager',
              directDownloadUrl: this.backendService.getDirectDownloadLink(),
              role: new RolePipe().transform(
                this.workspaceService.userAccessLevel
              )
            },
            unitDefinition: unitDef.definition ? unitDef.definition : ''
          },
          '*'
        );
      }
    }
    this.unitLoaded = true;
  }

  private buildEditor(editorId?: string) {
    if (this.iFrameElement) {
      this.iFrameElement.srcdoc = '';
      if (editorId) {
        this.moduleService
          .getModuleHtml(this.moduleService.editors[editorId])
          .then(editorData => {
            if (editorData) {
              this.setupEditorIFrame(editorData);
              this.lastEditorId = editorId;
            } else {
              this.message = this.translateService.instant(
                'workspace.editor-not-loaded',
                { id: editorId }
              );
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
      this.iFrameElement.srcdoc = editorHtml;
    }
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
