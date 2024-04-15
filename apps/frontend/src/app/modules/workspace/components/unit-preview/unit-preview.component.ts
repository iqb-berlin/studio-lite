import {
  AfterViewInit, Component, ElementRef, OnDestroy, ViewChild
} from '@angular/core';
import {
  Subject, takeUntil
} from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { VeronaModuleFactory } from '@studio-lite/shared-code';
import { TranslateService } from '@ngx-translate/core';
import { CodingScheme, Response } from '@iqb/responses';
import { MatDialog } from '@angular/material/dialog';
import { ShowCodingResultsComponent } from '@iqb/ngx-coding-components';
import { UnitSchemeDto } from '@studio-lite-lib/api-dto';
import { ModuleService } from '../../../shared/services/module.service';
import { PageData } from '../../models/page-data.interface';
import { AppService } from '../../../../services/app.service';
import { BackendService } from '../../services/backend.service';
import { WorkspaceService } from '../../services/workspace.service';
import { PreviewService } from '../../services/preview.service';
import { UnitDefinitionStore } from '../../classes/unit-definition-store';
import { Progress } from '../../models/types';
import { SubscribeUnitDefinitionChangesDirective } from '../../directives/subscribe-unit-definition-changes.directive';
import { PreviewBarComponent } from '../preview-bar/preview-bar.component';

@Component({
  templateUrl: './unit-preview.component.html',
  styleUrls: ['./unit-preview.component.scss'],
  host: { class: 'unit-preview' },
  standalone: true,
  imports: [PreviewBarComponent]
})

export class UnitPreviewComponent extends SubscribeUnitDefinitionChangesDirective implements AfterViewInit, OnDestroy {
  @ViewChild('hostingIframe') hostingIframe!: ElementRef;

  private iFrameElement: HTMLIFrameElement | undefined;
  private sessionId = '';
  private lastPlayerId = '';
  ngUnsubscribe = new Subject<void>();
  postMessageTarget: Window | undefined;
  playerName = '';
  playerApiVersion = 3;

  message = '';
  unitId: number = 0;
  pageList: PageData[] = [];
  presentationProgress: Progress = 'none';
  responseProgress: Progress = 'none';
  hasFocus: boolean = false;
  responses!: Response[];

  constructor(
    private appService: AppService,
    private snackBar: MatSnackBar,
    private backendService: BackendService,
    public workspaceService: WorkspaceService,
    private moduleService: ModuleService,
    public previewService: PreviewService,
    private translateService: TranslateService,
    private dialog: MatDialog
  ) {
    super();
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
              this.sendUnitData();
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
                this.responses = Object.values(msgData.unitState.dataParts)
                  .map((dp: unknown) => JSON.parse(dp as string))
                  .flat();
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
              this.snackBar.open(
                this.translateService
                  .instant('workspace.player-send-page-navigation-request', { target: msgData.newPage }),
                '',
                { duration: 3000 });
              this.gotoPage({ action: msgData.newPage });
              break;

            case 'vopPageNavigationCommand':
              this.snackBar.open(
                this.translateService
                  .instant('workspace.player-send-page-navigation-request', { target: msgData.target }),
                '',
                { duration: 3000 });
              this.gotoPage({ action: msgData.target });
              break;

            case 'vo.FromPlayer.UnitNavigationRequest':
              this.snackBar.open(
                this.translateService
                  .instant('workspace.player-send-unit-navigation-request',
                    { target: msgData.navigationTarget }),
                '',
                { duration: 3000 });
              break;

            case 'vopUnitNavigationRequestedNotification':
              this.snackBar.open(
                this.translateService
                  .instant('workspace.player-send-unit-navigation-request',
                    { target: msgData.target }),
                '',
                { duration: 3000 });
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

  ngAfterViewInit(): void {
    this.previewService.pagingMode
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => this.initPlayer());
  }

  private initPlayer(): void {
    this.iFrameElement = this.hostingIframe.nativeElement;
    this.workspaceService.selectedUnit$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        this.message = '';
        this.workspaceService.loadUnitMetadata().then(() => this.sendUnitData());
      });
    this.addSubscriptionForUnitDefinitionChanges();
  }

  async sendUnitData() {
    this.setPresentationStatus('none');
    this.setResponsesStatus('none');
    this.setPageList([], '');
    this.unitId = this.workspaceService.selectedUnit$.getValue();
    const unitMetadataStore = this.workspaceService.getUnitMetadataStore();
    if (this.unitId && unitMetadataStore) {
      const unitMetadata = unitMetadataStore.getData();
      if (Object.keys(this.moduleService.players).length === 0) await this.moduleService.loadList();
      const playerId = unitMetadata.player ?
        VeronaModuleFactory.getBestMatch(unitMetadata.player, Object.keys(this.moduleService.players)) : '';
      if (playerId) {
        if ((playerId === this.lastPlayerId) && this.postMessageTarget) {
          let unitDefinitionStore = this.workspaceService.getUnitDefinitionStore();
          if (unitDefinitionStore) {
            this.postUnitDef(unitDefinitionStore);
          } else {
            this.backendService.getUnitDefinition(this.workspaceService.selectedWorkspaceId, this.unitId)
              .subscribe(
                ued => {
                  if (ued) {
                    unitDefinitionStore = new UnitDefinitionStore(this.unitId, ued);
                    this.workspaceService.setUnitDefinitionStore(unitDefinitionStore);
                    this.postUnitDef(unitDefinitionStore);
                  } else {
                    this.snackBar.open(
                      this.translateService.instant('workspace.unit-definition-not-loaded'),
                      this.translateService.instant('workspace.error'),
                      { duration: 3000 });
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
        this.message = this.translateService.instant('workspace.no-player');
        this.buildPlayer();
      }
    } else {
      this.message = this.translateService.instant('workspace.unit-not-found');
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
              this.message = this.translateService
                .instant('workspace.player-not-loaded', { id: playerId });
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
      this.iFrameElement.srcdoc = playerHtml;
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
  }

  gotoPage(target: { action: string, index?: number }): void {
    const action = target.action;
    const index = target.index || 0;
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

  setPresentationStatus(status: string): void {
    if (status === 'yes' || status === 'complete') {
      this.presentationProgress = 'complete';
    } else if (status === 'no' || status === 'some') {
      this.presentationProgress = 'some';
    } else {
      this.presentationProgress = 'none';
    }
  }

  setResponsesStatus(status: string): void {
    if (status === 'all' || status === 'complete') {
      this.responseProgress = 'complete';
    } else if (status === 'yes' || status === 'some') {
      this.responseProgress = 'some';
    } else {
      this.responseProgress = 'none';
    }
  }

  setFocusStatus(status: boolean): void {
    this.hasFocus = status;
  }

  async checkCoding() {
    let codingScheme: CodingScheme;
    const data = await new Promise<UnitSchemeDto | undefined>(resolve => {
      resolve(this.workspaceService.getUnitSchemeStore()?.getData());
    });
    if (data && !this.workspaceService.isChanged()) {
      codingScheme = JSON.parse(data.scheme);
      if (codingScheme === null) {
        this.snackBar.open(
          this.translateService.instant('workspace.coding-check-error'),
          this.translateService.instant('workspace.error'),
          { duration: 3000 });
        return;
      }
      this.workspaceService.codingSchemer = new CodingScheme(codingScheme.variableCodings);
      const varsWithCodes = codingScheme.variableCodings
        .filter(vc => vc.codes.length > 0)
        .map(vc => vc.id);
      const newResponses = this.workspaceService.codingSchemer?.code(this.responses);
      this.showCodingResults(newResponses, varsWithCodes);
    } else {
      this.backendService.getUnitScheme(this.workspaceService.selectedWorkspaceId, this.unitId)
        .subscribe(schemeData => {
          if (schemeData) {
            codingScheme = JSON.parse(schemeData.scheme);
            if (codingScheme === null) {
              this.snackBar.open(
                this.translateService.instant('workspace.coding-check-error'),
                this.translateService.instant('workspace.error'),
                { duration: 3000 });
              return;
            }
            this.workspaceService.codingSchemer = new CodingScheme(codingScheme.variableCodings);
          }
          const varsWithCodes = codingScheme.variableCodings
            .filter(vc => vc.codes.length > 0)
            .map(vc => vc.id);
          const newResponses = this.workspaceService.codingSchemer?.code(this.responses);
          this.showCodingResults(newResponses, varsWithCodes);
        });
    }
  }

  private showCodingResults(responses: Response[], varsWithCodes:string[]): void {
    if (this.workspaceService.isChanged()) {
      this.snackBar.open(
        this.translateService.instant('workspace.save-unit-before-check'),
        this.translateService.instant('workspace.error'),
        { duration: 3000 });
    } else {
      this.dialog
        .open(ShowCodingResultsComponent, {
          data: { responses: responses, varsWithCodes: varsWithCodes },
          height: '80%',
          width: '60%'
        })
        .afterClosed()
        .pipe(
          takeUntil(this.ngUnsubscribe)
        ).subscribe(() => {
        });
    }
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
