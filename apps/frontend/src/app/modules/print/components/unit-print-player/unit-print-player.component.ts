import {
  AfterViewInit, Component, ElementRef, Input, OnDestroy, Output, ViewChild
} from '@angular/core';
import { fromEvent, Subject, takeUntil } from 'rxjs';
import { ModuleService } from '../../../shared/services/module.service';
import { AppService } from '../../../../services/app.service';
import { WorkspaceBackendService } from '../../../workspace/services/workspace-backend.service';
import { WorkspaceService } from '../../../workspace/services/workspace.service';
import { UnitDefinitionStore } from '../../../workspace/classes/unit-definition-store';

@Component({
  selector: 'studio-lite-unit-print-player',
  templateUrl: './unit-print-player.component.html',
  styleUrls: ['./unit-print-player.component.scss'],
  standalone: true
})
export class UnitPrintPlayerComponent implements AfterViewInit, OnDestroy {
  @ViewChild('hostingIframe') hostingIframe!: ElementRef;

  @Input() unitId!: number;
  @Input() workspaceId!: number;
  @Input() iFrameHeight!: number;
  @Input() playerId!: string;
  @Input() printElementIds!: boolean;
  @Input() printPreviewAutoHeight!: boolean;
  @Output() iFrameHeightChange = new Subject<number>();

  private iFrameElement: HTMLIFrameElement | undefined;
  private ngUnsubscribe = new Subject<void>();
  private sessionId = '';
  postMessageTarget: Window | undefined;
  playerApiVersion = 3;

  constructor(
    private appService: AppService,
    private backendService: WorkspaceBackendService,
    private workspaceService: WorkspaceService,
    private moduleService: ModuleService
  ) {
    this.appService.postMessage$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((m: MessageEvent) => {
        const msgData = m.data;
        const msgType = msgData.type;
        if ((msgType !== undefined) && (msgType !== null) && (m.source === this.iFrameElement?.contentWindow)) {
          switch (msgType) {
            case 'vopReadyNotification':
            case 'player':
            case 'vo.FromPlayer.ReadyNotification':
              if (!this.sessionId) {
                if (msgType === 'vopReadyNotification' || msgType === 'player') {
                  let majorVersion;
                  if (msgData.metadata) {
                    majorVersion = msgData.metadata.specVersion.match(/\d+/);
                  } else {
                    majorVersion = msgData.apiVersion ?
                      msgData.apiVersion.match(/\d+/) : msgData.specVersion.match(/\d+/);
                  }
                  if (majorVersion.length > 0) {
                    this.playerApiVersion = Number(majorVersion[0]);
                  } else {
                    this.playerApiVersion = 2;
                  }
                } else {
                  this.playerApiVersion = 1;
                }
                this.sessionId = Math.floor(Math.random() * 20000000 + 10000000)
                  .toString();
                this.postMessageTarget = m.source as Window;
                this.sendUnitDataToPlayer();
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

  ngAfterViewInit(): void {
    this.iFrameElement = this.hostingIframe.nativeElement;
    this.buildPlayer(this.playerId);
  }

  private sendUnitDataToPlayer(): void {
    this.backendService.getUnitDefinition(this.workspaceId, this.unitId)
      .subscribe(
        ued => {
          if (ued) {
            const unitDefinitionStore = new UnitDefinitionStore(this.unitId, ued);
            this.postUnitDef(unitDefinitionStore);
          }
        }
      );
  }

  private postUnitDef(unitDefinitionStore: UnitDefinitionStore): void {
    const unitDef = unitDefinitionStore.getData();
    if (this.postMessageTarget) {
      if (this.playerApiVersion === 1) {
        this.postMessageTarget.postMessage({
          type: 'vo.ToPlayer.DataTransfer',
          sessionId: this.sessionId,
          unitDefinition: unitDef.definition ? unitDef.definition : ''
        }, '*');
      } else {
        this.postMessageTarget.postMessage({
          type: 'vopStartCommand',
          sessionId: this.sessionId,
          unitState: {
            dataParts: {},
            presentationProgress: 'none',
            responseProgress: 'none'
          },
          playerConfig: {
            stateReportPolicy: 'eager',
            pagingMode: 'concat-scroll',
            printMode: this.printElementIds ? 'on-with-ids' : 'on',
            directDownloadUrl: this.backendService.getDirectDownloadLink()
          },
          unitDefinition: unitDef.definition ? unitDef.definition : ''
        }, '*');
      }
    }
  }

  private buildPlayer(playerId?: string) {
    this.postMessageTarget = undefined;
    if (this.iFrameElement) {
      this.iFrameElement.srcdoc = '';
      if (playerId) {
        this.moduleService.getModuleHtml(this.moduleService.players[playerId])
          .then(playerData => {
            if (playerData) {
              this.setupPlayerIFrame(playerData);
            }
          });
      }
    }
  }

  private setupPlayerIFrame(playerHtml: string): void {
    if (this.iFrameElement && this.iFrameElement.parentElement) {
      if (this.printPreviewAutoHeight) {
        fromEvent(this.iFrameElement, 'load')
          .pipe(takeUntil(this.ngUnsubscribe))
          .subscribe(() => {
            setTimeout(() => {
              this.calculateIFrameHeight();
            }, 1000);
          });
      }
      this.iFrameElement.srcdoc = playerHtml;
    }
  }

  private calculateIFrameHeight(): void {
    const iframeDoc = this.iFrameElement?.contentDocument || this.iFrameElement?.contentWindow?.document;
    const height = iframeDoc && iframeDoc.body.offsetHeight;
    if (height) {
      this.iFrameHeight = height;
      this.iFrameHeightChange.next(height);
    }
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
