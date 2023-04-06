import {
  AfterViewInit, Component, ElementRef, Input, ViewChild
} from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { ModuleService } from '@studio-lite/studio-components';
import { AppService } from '../../../../app/services/app.service';
import { BackendService } from '../../../workspace/services/backend.service';
import { WorkspaceService } from '../../../workspace/services/workspace.service';
import { UnitDefinitionStore } from '../../../workspace/classes/unit-definition-store';

@Component({
  selector: 'studio-lite-unit-print-player',
  templateUrl: './unit-print-player.component.html',
  styleUrls: ['./unit-print-player.component.scss']
})
export class UnitPrintPlayerComponent implements AfterViewInit {
  @ViewChild('hostingIframe') hostingIframe!: ElementRef;

  @Input() unitId!: number;
  @Input() workspaceId!: number;
  @Input() iFrameHeight!: number;
  @Input() playerId!: string;

  private iFrameElement: HTMLIFrameElement | undefined;
  private ngUnsubscribe = new Subject<void>();
  private sessionId = '';
  postMessageTarget: Window | undefined;
  playerApiVersion = 3;

  constructor(
    private appService: AppService,
    private backendService: BackendService,
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
            pagingMode: 'concat-scroll', // Best to print
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
      this.iFrameElement.srcdoc = playerHtml;
    }
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
