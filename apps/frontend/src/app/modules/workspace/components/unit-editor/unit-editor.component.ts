import {
  AfterViewInit, Component, ElementRef, ViewChild
} from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { ModuleService } from '../../../shared/services/module.service';
import { WorkspaceBackendService } from '../../services/workspace-backend.service';
import { AppService } from '../../../../services/app.service';
import { WorkspaceService } from '../../services/workspace.service';
import { UnitDefinitionStore } from '../../classes/unit-definition-store';
import { RolePipe } from '../../pipes/role.pipe';
import { VeronaModuleDirective } from '../../directives/verona-module.directive';

@Component({
  selector: 'studio-lite-unit-editor',
  templateUrl: './unit-editor.component.html',
  styleUrls: ['./unit-editor.component.scss'],
  host: { class: 'unit-editor' },
  imports: [MatProgressSpinner]
})
export class UnitEditorComponent extends VeronaModuleDirective implements AfterViewInit {
  @ViewChild('hostingIframe') hostingIframe!: ElementRef;
  editorApiVersion = 1;

  constructor(
    public backendService: WorkspaceBackendService,
    public workspaceService: WorkspaceService,
    public snackBar: MatSnackBar,
    public moduleService: ModuleService,
    public appService: AppService,
    public translateService: TranslateService
  ) {
    super();
  }

  ngAfterViewInit(): void {
    this.iFrameElement = this.hostingIframe.nativeElement;
    this.subscribeForPostMessages();
    this.subscribeForSelectedUnitChange();
  }

  onSelectedUnitChange(): void {
    if (this.unitLoaded.getValue()) {
      this.unitLoaded.next(false);
      this.message = '';
      this.workspaceService
        .loadUnitProperties()
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(() => {
          this.onLoadUnitProperties();
        });
    } else {
      this.ngUnsubscribe.next();
      this.ngUnsubscribe.complete();
      this.ngUnsubscribe = new Subject<void>();
      this.unitLoaded.next(true);
      this.subscribeForPostMessages();
      this.subscribeForSelectedUnitChange();
    }
  }

  handleIncomingMessage(m: MessageEvent) {
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
          this.sessionId = UnitEditorComponent.getSessionId();
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
  }

  private onLoadUnitProperties() {
    this.getVeronaModuleId(this.workspaceService.getUnitMetadataStore(), 'editor')
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(editorId => {
        if (editorId) {
          if (editorId === this.lastVeronaModulId && this.postMessageTarget) {
            this.sendUnitDefinition(
              this.workspaceService.selectedUnit$.getValue(),
              this.workspaceService.getUnitDefinitionStore()
            );
          } else {
            this.postMessageTarget = undefined;
            this.buildVeronaModule(editorId, 'editor');
            // editor gets unit data via ReadyNotification
          }
        } else {
          this.message = this.translateService.instant('workspace.no-editor');
          this.postMessageTarget = undefined;
        }
      });
  }

  postStore(unitDefinitionStore: UnitDefinitionStore): void {
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
      this.unitLoaded.next(true);
    }
  }
}
