import {
  Component, HostListener, OnDestroy, OnInit
} from '@angular/core';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AppService } from '../../app.service';
import { ReviewService } from '../review.service';
import { UnitPage } from '../classes/unit-page.class';
import { PageData } from '../../workspace/unit/unit-preview/unit-preview.classes';
import { UnitData } from '../classes/unit-data.class';
import { BackendService } from '../backend.service';

@Component({
  selector: 'studio-lite-units',
  templateUrl: './units.component.html',
  styleUrls: ['./units.component.scss']
})
export class UnitsComponent implements OnInit, OnDestroy {
  routingSubscription: Subscription | null = null;
  postMessageSubscription: Subscription | null = null;
  private iFrameElement: HTMLIFrameElement | undefined;
  message = '';
  pageList: UnitPage[] = [];
  postMessageTarget: Window | undefined;
  playerApiVersion = 3;
  private sessionId = '';
  private lastPlayerId = '';
  unitData: UnitData = {
    databaseId: 0,
    sequenceId: 0,
    playerId: '',
    responses: '',
    definition: '',
    name: ''
  };

  constructor(
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private backendService: BackendService,
    public appService: AppService,
    public reviewService: ReviewService
  ) {}

  ngOnInit(): void {
    setTimeout(() => {
      this.iFrameElement = <HTMLIFrameElement>document.querySelector('#hosting-iframe');
      this.postMessageSubscription = this.appService.postMessage$
        .subscribe(messageEvent => this.handleIncomingMessage(messageEvent));
      this.routingSubscription = this.route.params.subscribe(params => {
        // eslint-disable-next-line @typescript-eslint/dot-notation
        this.reviewService.currentUnitSequenceId = parseInt(params['u'], 10);
        const unitData = this.reviewService.units.filter(
          u => u.sequenceId === this.reviewService.currentUnitSequenceId
        );
        this.unitData = unitData[0];
        this.iFrameElement = <HTMLIFrameElement>document.querySelector('#hosting-iframe');
        this.sendUnitDataToPlayer();
      });
    });
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

  private handleIncomingMessage(m: MessageEvent) {
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
          this.sessionId = Math.floor(Math.random() * 20000000 + 10000000)
            .toString();
          this.postMessageTarget = m.source as Window;
          this.sendUnitDataToPlayer();
          break;

        case 'vo.FromPlayer.StartedNotification':
          this.setPageList(msgData.validPages, msgData.currentPage);
          this.unitData.responses = msgData.responsesGiven;
          break;

        case 'vopStateChangedNotification':
          if (msgData.playerState) {
            const pages = msgData.playerState.validPages;
            this.setPageList(Object.keys(pages), msgData.playerState.currentPage);
          }
          if (msgData.unitState) {
            this.unitData.responses = msgData.unitState.responseProgress;
          }
          break;

        case 'vo.FromPlayer.ChangedDataTransfer':
          this.setPageList(msgData.validPages, msgData.currentPage);
          this.unitData.responses = msgData.responsesGiven;
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
          // ignore
          break;

        default:
          // eslint-disable-next-line no-console
          console.warn(`processMessagePost ignored message: ${msgType}`);
          break;
      }
    }
  }

  sendUnitDataToPlayer(): void {
    this.setPageList([], '');
    this.backendService.getUnitMetadata(this.reviewService.reviewId, this.unitData.databaseId).subscribe(umd => {
      if (umd) {
        this.unitData.playerId = umd.player ? umd.player : '';
        const playerId = this.unitData.playerId ? this.appService.playerList.getBestMatch(this.unitData.playerId) : '';
        this.unitData.name = `${this.unitData.sequenceId + 1}: ${umd.key}${umd.name ? ` - ${umd.name}` : ''}`;
        this.reviewService.setHeaderText(this.unitData.name);
        if (playerId) {
          if ((playerId === this.lastPlayerId) && this.postMessageTarget) {
            // TODO: Ist das nicht EditorCode, der hier entfernt werden kann?
            if (this.unitData.definition) {
              this.postUnitDef(this.unitData.definition);
            } else {
              this.backendService.getUnitDefinition(this.reviewService.reviewId, this.unitData.databaseId)
                .subscribe(
                  ued => {
                    if (ued) {
                      this.unitData.definition = ued.definition || '';
                      this.postUnitDef(this.unitData.definition);
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
      }
    });
  }

  private postUnitDef(unitDef: string): void {
    if (this.postMessageTarget) {
      if (this.playerApiVersion === 1) {
        this.postMessageTarget.postMessage({
          type: 'vo.ToPlayer.DataTransfer',
          sessionId: this.sessionId,
          unitDefinition: unitDef || ''
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
            pagingMode: this.reviewService.reviewSettings?.pagingMode,
            directDownloadUrl: this.backendService.getDirectDownloadLink()
          },
          unitDefinition: unitDef || ''
        }, '*');
      }
    }
  }

  private buildPlayer(playerId?: string) {
    this.postMessageTarget = undefined;
    if (this.iFrameElement) {
      this.iFrameElement.srcdoc = '';
      if (playerId) {
        this.reviewService.getModuleHtml(playerId)
          .then(playerData => {
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
  }

  ngOnDestroy() {
    if (this.routingSubscription) this.routingSubscription.unsubscribe();
    if (this.postMessageSubscription) this.postMessageSubscription.unsubscribe();
  }
}
