import {
  Component, HostListener, OnDestroy, OnInit
} from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { VeronaModuleFactory } from '@studio-lite/shared-code';
import { ModuleService } from '@studio-lite/studio-components';
import { PageData, StatusVisual } from './unit-preview.classes';
import { AppService } from '../../../app.service';
import { BackendService } from '../../services/backend.service';
import { WorkspaceService } from '../../services/workspace.service';
import { UnitDefinitionStore } from '../../workspace.classes';
import { PreviewService } from './preview.service';

@Component({
  templateUrl: './unit-preview.component.html',
  styleUrls: ['./unit-preview.component.css'],
  host: { class: 'unit-preview' }
})
export class UnitPreviewComponent implements OnInit, OnDestroy {
  private iFrameElement: HTMLIFrameElement | undefined;
  private ngUnsubscribe = new Subject<void>();
  private sessionId = '';
  postMessageTarget: Window | undefined;
  private lastPlayerId = '';
  playerName = '';
  playerApiVersion = 3;
  statusVisual: StatusVisual[] = [
    {
      id: 'presentation',
      label: 'P',
      color: 'DarkGray',
      description: 'Status: Vollständigkeit der Präsentation'
    },
    {
      id: 'responses',
      label: 'R',
      color: 'DarkGray',
      description: 'Status: Vollständigkeit der Antworten'
    },
    {
      id: 'focus',
      label: 'F',
      color: 'DarkGray',
      description: 'Status: Player hat Fenster-Fokus'
    }
  ];

  message = '';
  unitId: number = 0;
  showPageNav = false;
  pageList: PageData[] = [];

  constructor(
    private appService: AppService,
    private snackBar: MatSnackBar,
    private backendService: BackendService,
    public workspaceService: WorkspaceService,
    private moduleService: ModuleService,
    public previewService: PreviewService
  ) {
    this.appService.postMessage$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((m: MessageEvent) => {
        const msgData = m.data;
        const msgType = msgData.type;
        if ((msgType !== undefined) && (msgType !== null)) {
          switch (msgType) {
            case 'vopReadyNotification':
            case 'player':
            case 'vo.FromPlayer.ReadyNotification':
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
              break;

            case 'vo.FromPlayer.StartedNotification':
              this.setPageList(msgData.validPages, msgData.currentPage);
              this.setPresentationStatus(msgData.presentationComplete);
              this.setResponsesStatus(msgData.responsesGiven);
              break;

            case 'vopStateChangedNotification':
              if (msgData.playerState) {
                const pages = msgData.playerState.validPages;
                this.setPageList(Object.keys(pages), msgData.playerState.currentPage);
              }
              if (msgData.unitState) {
                this.setPresentationStatus(msgData.unitState.presentationProgress);
                this.setResponsesStatus(msgData.unitState.responseProgress);
              }
              break;

            case 'vo.FromPlayer.ChangedDataTransfer':
              this.setPageList(msgData.validPages, msgData.currentPage);
              this.setPresentationStatus(msgData.presentationComplete);
              this.setResponsesStatus(msgData.responsesGiven);
              break;

            case 'vo.FromPlayer.PageNavigationRequest':
              this.snackBar.open(`Player sendet PageNavigationRequest: "${
                msgData.newPage}"`, '', { duration: 3000 });
              this.gotoPage(msgData.newPage);
              break;

            case 'vopPageNavigationCommand':
              this.snackBar.open(`Player sendet PageNavigationRequest: "${
                msgData.target}"`, '', { duration: 3000 });
              this.gotoPage(msgData.target);
              break;

            case 'vo.FromPlayer.UnitNavigationRequest':
              this.snackBar.open(`Player sendet UnitNavigationRequest: "${
                msgData.navigationTarget}"`, '', { duration: 3000 });
              break;

            case 'vopUnitNavigationRequestedNotification':
              this.snackBar.open(`Player sendet UnitNavigationRequest: "${
                msgData.target}"`, '', { duration: 3000 });
              break;

            case 'vopWindowFocusChangedNotification':
              this.setFocusStatus(msgData.hasFocus);
              break;

            default:
              // eslint-disable-next-line no-console
              console.warn(`processMessagePost ignored message: ${msgType}`);
              break;
          }
        }
      });
    this.previewService.pagingMode
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => this.initPlayer());
  }

  ngOnInit(): void {
    this.initPlayer();
  }

  private initPlayer(): void {
    setTimeout(() => {
      this.iFrameElement = <HTMLIFrameElement>document.querySelector('#hosting-iframe');
      this.workspaceService.selectedUnit$
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(() => {
          this.message = '';
          this.workspaceService.loadUnitMetadata().then(() => this.sendUnitDataToPlayer());
        });
    });
  }

  async sendUnitDataToPlayer() {
    this.setPresentationStatus('none');
    this.setResponsesStatus('none');
    this.setPageList([], '');
    this.unitId = this.workspaceService.selectedUnit$.getValue();
    if (this.unitId && this.workspaceService.unitMetadataStore) {
      const unitMetadata = this.workspaceService.unitMetadataStore.getData();
      if (Object.keys(this.moduleService.players).length === 0) await this.moduleService.loadList();
      const playerId = unitMetadata.player ?
        VeronaModuleFactory.getBestMatch(unitMetadata.player, Object.keys(this.moduleService.players)) : '';
      if (playerId) {
        if ((playerId === this.lastPlayerId) && this.postMessageTarget) {
          // TODO: Ist das nicht EditorCode, der hier entfernt werden kann?
          if (this.workspaceService.unitDefinitionStore) {
            this.postUnitDef(this.workspaceService.unitDefinitionStore);
          } else {
            this.backendService.getUnitDefinition(this.workspaceService.selectedWorkspaceId, this.unitId)
              .subscribe(
                ued => {
                  if (ued) {
                    this.workspaceService.unitDefinitionStore = new UnitDefinitionStore(this.unitId, ued);
                    this.postUnitDef(this.workspaceService.unitDefinitionStore);
                  } else {
                    this.snackBar.open(
                      'Konnte Aufgabendefinition nicht laden', 'Fehler', { duration: 3000 }
                    );
                  }
                }
              );
          }
        } else {
          this.message = '';
          this.buildPlayer(playerId);
          // player gets unit data via ReadyNotification
        }
      } else {
        this.message = 'Kein gültiger Player zugewiesen. Bitte gehen Sie zu "Eigenschaften".';
        this.buildPlayer();
      }
    } else {
      this.message = 'Aufgabe nicht gefunden oder Daten fehlerhaft.';
      this.buildPlayer();
    }
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
            pagingMode: this.previewService.pagingMode.value,
            directDownloadUrl: this.backendService.getDirectDownloadLink()
          },
          unitDefinition: unitDef.definition ? unitDef.definition : ''
        }, '*');
      }
    }
  }

  postNavigationDenied(): void {
    if (this.postMessageTarget) {
      this.postMessageTarget.postMessage({
        type: 'vopNavigationDeniedNotification',
        sessionId: this.sessionId,
        reason: ['presentationIncomplete', 'responsesIncomplete']
      }, '*');
    }
  }

  private buildPlayer(playerId?: string) {
    this.postMessageTarget = undefined;
    if (this.iFrameElement) {
      this.iFrameElement.srcdoc = '';
      if (playerId) {
        this.moduleService.getModuleHtml(this.moduleService.players[playerId])
          .then(playerData => {
            this.playerName = playerId;
            if (playerData) {
              this.setupPlayerIFrame(playerData);
              this.lastPlayerId = playerId;
            } else {
              this.message = `Der Player "${playerId}" konnte nicht geladen werden.`;
              this.lastPlayerId = '';
            }
          });
      } else {
        this.lastPlayerId = '';
      }
    }
  }

  private setupPlayerIFrame(playerHtml: string): void {
    if (this.iFrameElement && this.iFrameElement.parentElement) {
      const divHeight = this.iFrameElement.parentElement.clientHeight;
      this.iFrameElement.height = `${String(divHeight - 5)}px`;
      this.iFrameElement.srcdoc = playerHtml;
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    if (this.iFrameElement && this.iFrameElement.parentElement) {
      const divHeight = this.iFrameElement.parentElement.clientHeight;
      this.iFrameElement.height = `${String(divHeight - 5)}px`;
    }
  }

  // ++++++++++++ page nav ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  setPageList(validPages?: string[], currentPage?: string): void {
    if ((validPages instanceof Array)) {
      const newPageList: PageData[] = [];
      if (validPages.length > 1) {
        for (let i = 0; i < validPages.length; i++) {
          if (i === 0) {
            newPageList.push({
              index: -1,
              id: '#previous',
              disabled: validPages[i] === currentPage,
              type: '#previous'
            });
          }

          newPageList.push({
            index: i + 1,
            id: validPages[i],
            disabled: validPages[i] === currentPage,
            type: '#goto'
          });

          if (i === validPages.length - 1) {
            newPageList.push({
              index: -1,
              id: '#next',
              disabled: validPages[i] === currentPage,
              type: '#next'
            });
          }
        }
      }
      this.pageList = newPageList;
    } else if ((this.pageList.length > 1) && (currentPage !== undefined)) {
      let currentPageIndex = 0;
      for (let i = 0; i < this.pageList.length; i++) {
        if (this.pageList[i].type === '#goto') {
          if (this.pageList[i].id === currentPage) {
            this.pageList[i].disabled = true;
            currentPageIndex = i;
          } else {
            this.pageList[i].disabled = false;
          }
        }
      }
      if (currentPageIndex === 1) {
        this.pageList[0].disabled = true;
        this.pageList[this.pageList.length - 1].disabled = false;
      } else {
        this.pageList[0].disabled = false;
        this.pageList[this.pageList.length - 1].disabled = currentPageIndex === this.pageList.length - 2;
      }
    }
    this.showPageNav = this.pageList.length > 0;
  }

  gotoPage(action: string, index = 0): void {
    let nextPageId = '';
    // currentpage is detected by disabled-attribute of page
    if (action === '#next') {
      let currentPageIndex = 0;
      for (let i = 0; i < this.pageList.length; i++) {
        if ((this.pageList[i].index > 0) && (this.pageList[i].disabled)) {
          currentPageIndex = i;
          break;
        }
      }
      if ((currentPageIndex > 0) && (currentPageIndex < this.pageList.length - 2)) {
        nextPageId = this.pageList[currentPageIndex + 1].id;
      }
    } else if (action === '#previous') {
      let currentPageIndex = 0;
      for (let i = 0; i < this.pageList.length; i++) {
        if ((this.pageList[i].index > 0) && (this.pageList[i].disabled)) {
          currentPageIndex = i;
          break;
        }
      }
      if (currentPageIndex > 1) {
        nextPageId = this.pageList[currentPageIndex - 1].id;
      }
    } else if (action === '#goto') {
      if ((index > 0) && (index < this.pageList.length - 1)) {
        nextPageId = this.pageList[index].id;
      }
    } else if (index === 0) {
      // call from player
      nextPageId = action;
    }

    if (nextPageId.length > 0 && this.postMessageTarget) {
      if (this.playerApiVersion === 1) {
        this.postMessageTarget.postMessage({
          type: 'vo.ToPlayer.NavigateToPage',
          sessionId: this.sessionId,
          newPage: nextPageId
        }, '*');
      } else {
        this.postMessageTarget.postMessage({
          type: 'vopPageNavigationCommand',
          sessionId: this.sessionId,
          target: nextPageId
        }, '*');
      }
    }
  }

  // ++++++++++++ Status ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

  setPresentationStatus(status: string): void { // 'yes' | 'no' | '' | undefined;
    if (status === 'yes' || status === 'complete') {
      this.changeStatusColor('presentation', 'LimeGreen');
    } else if (status === 'no' || status === 'some') {
      this.changeStatusColor('presentation', 'LightCoral');
    } else if (status === '' || status === 'none') {
      this.changeStatusColor('presentation', 'DarkGray');
    }
    // if undefined: no change
  }

  setResponsesStatus(status: string): void { // 'yes' | 'no' | 'all' | '' | undefined
    if (status === 'yes' || status === 'some') {
      this.changeStatusColor('responses', 'Gold');
    } else if (status === 'no') {
      this.changeStatusColor('responses', 'LightCoral');
    } else if (status === 'all' || status === 'complete') {
      this.changeStatusColor('responses', 'LimeGreen');
    } else if (status === '' || status === 'none') {
      this.changeStatusColor('responses', 'DarkGray');
    }
    // if undefined: no change
  }

  setFocusStatus(status: boolean): void { // 'yes' | 'no' | '' | undefined;
    this.changeStatusColor('focus', status ? 'LimeGreen' : 'LightCoral');
  }

  changeStatusColor(id: string, newcolor: string): void {
    for (let i = 0; i < this.statusVisual.length; i++) {
      if (this.statusVisual[i].id === id) {
        if (this.statusVisual[i].color !== newcolor) {
          this.statusVisual[i].color = newcolor;
          break;
        }
      }
    }
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
