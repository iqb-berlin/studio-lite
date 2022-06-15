import {
  Component, HostListener, OnDestroy, OnInit
} from '@angular/core';
import { Subscription } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UnitMetadataDto } from '@studio-lite-lib/api-dto';
import {
  PageData,
  StatusVisual
} from './unit-preview.classes';
import { AppService } from '../../../app.service';
import { BackendService } from '../../backend.service';
import { WorkspaceService } from '../../workspace.service';
import { UnitDefinitionStore, UnitMetadataStore } from '../../workspace.classes';

@Component({
  templateUrl: './unit-preview.component.html',
  styleUrls: ['./unit-preview.component.css']
})
export class UnitPreviewComponent implements OnInit, OnDestroy {
  iFrameHostElement: HTMLDivElement | undefined;
  private iFrameElement: HTMLIFrameElement | undefined;
  private readonly postMessageSubscription: Subscription | undefined;
  private unitIdChangedSubscription: Subscription | undefined;
  private sessionId = '';
  postMessageTarget: Window | undefined;
  private lastPlayerId = '';
  playerName = '';
  playerApiVersion = 3;
  statusVisual: StatusVisual[] = [
    {
      id: 'presentation', label: 'P', color: 'DarkGray', description: 'Status: Vollständigkeit der Präsentation'
    },
    {
      id: 'responses', label: 'R', color: 'DarkGray', description: 'Status: Vollständigkeit der Antworten'
    },
    {
      id: 'focus', label: 'F', color: 'DarkGray', description: 'Status: Player hat Fenster-Fokus'
    }
  ];

  message = '';

  showPageNav = false;
  pageList: PageData[] = [];

  constructor(
    private appService: AppService,
    private snackBar: MatSnackBar,
    private backendService: BackendService,
    private workspaceService: WorkspaceService
  ) {
    this.postMessageSubscription = this.appService.postMessage$.subscribe((m: MessageEvent) => {
      const msgData = m.data;
      const msgType = msgData.type;
      if ((msgType !== undefined) && (msgType !== null)) {
        switch (msgType) {
          case 'vopReadyNotification':
          case 'player':
          case 'vo.FromPlayer.ReadyNotification':
            if (msgType === 'vopReadyNotification' || msgType === 'player') {
              const majorVersion = msgData.apiVersion ?
                msgData.apiVersion.match(/\d+/) : msgData.specVersion.match(/\d+/);
              if (majorVersion.length > 0) {
                const majorVersionNumber = Number(majorVersion[0]);
                this.playerApiVersion = majorVersionNumber > 2 ? 3 : 2;
              } else {
                this.playerApiVersion = 2;
              }
            } else {
              this.playerApiVersion = 1;
            }
            this.sessionId = Math.floor(Math.random() * 20000000 + 10000000).toString();
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
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.iFrameHostElement = <HTMLIFrameElement>document.querySelector('#iFrameHostPlayer');
      this.unitIdChangedSubscription = this.workspaceService.selectedUnit$.subscribe(() => {
        this.message = '';
        if (this.workspaceService.unitMetadataStore) {
          this.sendUnitDataToPlayer();
        } else {
          const selectedUnitId = this.workspaceService.selectedUnit$.getValue();
          this.backendService.getUnitMetadata(this.workspaceService.selectedWorkspace,
            selectedUnitId).subscribe(unitData => {
            this.workspaceService.unitMetadataStore = new UnitMetadataStore(
              unitData || <UnitMetadataDto>{ id: selectedUnitId }
            );
            this.sendUnitDataToPlayer();
          });
        }
      });
    });
  }

  sendUnitDataToPlayer(): void {
    this.setPresentationStatus('none');
    this.setResponsesStatus('none');
    this.setPageList([], '');
    const unitId = this.workspaceService.selectedUnit$.getValue();
    if (unitId && unitId > 0 && this.workspaceService.unitMetadataStore) {
      const unitMetadata = this.workspaceService.unitMetadataStore.getData();
      const playerId = unitMetadata.player ? this.workspaceService.playerList.getBestMatch(unitMetadata.player) : '';
      if (playerId) {
        if ((playerId === this.lastPlayerId) && this.postMessageTarget) {
          if (this.workspaceService.unitDefinitionStore) {
            this.postUnitDef(this.workspaceService.unitDefinitionStore);
          } else {
            this.backendService.getUnitDefinition(this.workspaceService.selectedWorkspace, unitId).subscribe(
              ued => {
                if (ued) {
                  this.workspaceService.unitDefinitionStore = new UnitDefinitionStore(unitId, ued);
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
            stateReportPolicy: 'eager'
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
    this.iFrameElement = undefined;
    this.postMessageTarget = undefined;
    if (this.iFrameHostElement) {
      while (this.iFrameHostElement.lastChild) {
        this.iFrameHostElement.removeChild(this.iFrameHostElement.lastChild);
      }
      if (playerId) {
        this.workspaceService.getModuleHtml(playerId).then(playerData => {
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
    if (this.iFrameHostElement) {
      this.iFrameElement = <HTMLIFrameElement>document.createElement('iframe');
      this.iFrameElement.setAttribute('sandbox', 'allow-forms allow-scripts allow-same-origin');
      this.iFrameElement.setAttribute('class', 'unitHost');
      this.iFrameElement.setAttribute('height', String(this.iFrameHostElement.clientHeight - 5));
      this.iFrameHostElement.appendChild(this.iFrameElement);
      this.iFrameElement.setAttribute('srcdoc', playerHtml);
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    if (this.iFrameElement && this.iFrameHostElement) {
      const divHeight = this.iFrameHostElement.clientHeight;
      this.iFrameElement.setAttribute('height', String(divHeight - 5));
      // TODO: Why minus 5px?
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
    if (this.postMessageSubscription) this.postMessageSubscription.unsubscribe();
    if (this.unitIdChangedSubscription) this.unitIdChangedSubscription.unsubscribe();
  }
}
