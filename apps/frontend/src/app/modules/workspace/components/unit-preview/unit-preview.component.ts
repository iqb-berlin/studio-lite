import {
  AfterViewInit, Component, ElementRef, ViewChild
} from '@angular/core';
import {
  skip, Subject, takeUntil
} from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { ShowCodingResultsComponent } from '@iqb/ngx-coding-components';
import { UnitSchemeDto } from '@studio-lite-lib/api-dto';
import { CodingScheme } from '@iqbspecs/coding-scheme/coding-scheme.interface';
import { CodingSchemeFactory } from '@iqb/responses';
import { Response } from '@iqbspecs/response/response.interface';
import { Router } from '@angular/router';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { ModuleService } from '../../../shared/services/module.service';
import { PageData } from '../../models/page-data.interface';
import { AppService } from '../../../../services/app.service';
import { WorkspaceBackendService } from '../../services/workspace-backend.service';
import { WorkspaceService } from '../../services/workspace.service';
import { PreviewService } from '../../services/preview.service';
import { UnitDefinitionStore } from '../../classes/unit-definition-store';
import { Progress } from '../../models/types';
import { SubscribeUnitDefinitionChangesDirective } from '../../directives/subscribe-unit-definition-changes.directive';
import { ShowResponsesComponent } from '../show-responses/show-responses.component';
import { PreviewBarComponent } from '../preview-bar/preview-bar.component';
import {
  PrintOptionsDialogComponent
} from '../../../print/components/print-options-dialog/print-options-dialog.component';

@Component({
  templateUrl: './unit-preview.component.html',
  styleUrls: ['./unit-preview.component.scss'],
  host: { class: 'unit-preview' },
  imports: [PreviewBarComponent, MatProgressSpinner]
})
export class UnitPreviewComponent extends SubscribeUnitDefinitionChangesDirective
  implements AfterViewInit {
  @ViewChild('hostingIframe') hostingIframe!: ElementRef;
  playerName = '';
  playerApiVersion = 3;
  pageList: PageData[] = [];
  presentationProgress: Progress = 'none';
  responseProgress: Progress = 'none';
  hasFocus: boolean = false;
  private dataParts!: Record<string, string> | null;
  private unitStateDataType: string | null = null;

  constructor(
    public appService: AppService,
    public snackBar: MatSnackBar,
    public backendService: WorkspaceBackendService,
    public workspaceService: WorkspaceService,
    public moduleService: ModuleService,
    public previewService: PreviewService,
    public translateService: TranslateService,
    private dialog: MatDialog,
    private router: Router
  ) {
    super();
  }

  ngAfterViewInit(): void {
    this.iFrameElement = this.hostingIframe.nativeElement;
    this.subscribeForPostMessages();
    this.subscribeForSelectedUnitChange();
    this.addSubscriptionForUnitDefinitionChanges();
    this.subscribeForPagingModeChanges();
  }

  private subscribeForPagingModeChanges(): void {
    this.previewService.pagingMode
      .pipe(takeUntil(this.ngUnsubscribe), skip(1))
      .subscribe(() => this.postPlayerConfigChangedNotificationMessage());
  }

  private isIqbStandardResponse(): boolean {
    if (this.unitStateDataType) {
      return this.unitStateDataType.split('@')[0] === 'iqb-standard';
    }
    return false;
  }

  private getResponses(): Response[] | null {
    if (this.dataParts) {
      const dataPartValues = Object.entries(this.dataParts)
        .map(kv => ({ [kv[0]]: JSON.parse(kv[1]) }))
        .reduce((previous, current) => ({ ...previous, ...current }), {});
      return Object.values(dataPartValues).flat();
    }
    return null;
  }

  onSelectedUnitChange() {
    if (this.unitLoaded.getValue()) {
      this.unitLoaded.next(false);
      this.dataParts = null;
      this.unitStateDataType = null;
      this.message = '';
      this.workspaceService
        .loadUnitProperties()
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(() => this.onLoadUnitProperties());
    } else {
      this.ngUnsubscribe.next();
      this.ngUnsubscribe.complete();
      this.ngUnsubscribe = new Subject<void>();
      this.unitLoaded.next(true);
      this.subscribeForPostMessages();
      this.subscribeForSelectedUnitChange();
      this.addSubscriptionForUnitDefinitionChanges();
      this.subscribeForPagingModeChanges();
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
                msgData.apiVersion.match(/\d+/) :
                msgData.specVersion.match(/\d+/);
            }
            if (majorVersion.length > 0) {
              this.playerApiVersion = Number(majorVersion[0]);
            } else {
              this.playerApiVersion = 2;
            }
          } else {
            this.playerApiVersion = 1;
          }
          this.sessionId = UnitPreviewComponent.getSessionId();
          this.postMessageTarget = m.source as Window;
          this.sendUnitDefinition(
            this.workspaceService.selectedUnit$.getValue(),
            this.workspaceService.getUnitDefinitionStore()
          );
          break;

        case 'vo.FromPlayer.StartedNotification':
          this.setPageList(msgData.validPages, msgData.currentPage);
          this.setPresentationStatus(msgData.presentationComplete);
          this.setResponsesStatus(msgData.responsesGiven);
          break;

        case 'vopStateChangedNotification':
          if (msgData.playerState) {
            const pages = msgData.playerState.validPages;
            const targets = Array.isArray(pages) ?
              pages.map((p: { id: string; label: string }) => p.id) :
              Object.keys(pages);
            this.setPageList(targets, msgData.playerState.currentPage);
          }
          if (msgData.unitState) {
            this.setPresentationStatus(msgData.unitState.presentationProgress);
            this.setResponsesStatus(msgData.unitState.responseProgress);
            if (msgData.unitState.dataParts) {
              const dataParts: Record<string, string> =
                msgData.unitState.dataParts;
              this.dataParts = {
                ...(this.dataParts ? this.dataParts : {}),
                ...dataParts
              };
              this.unitStateDataType =
                msgData.unitState.unitStateDataType || null;
            }
          }
          break;

        case 'vo.FromPlayer.ChangedDataTransfer':
          this.setPageList(msgData.validPages, msgData.currentPage);
          this.setPresentationStatus(msgData.presentationComplete);
          this.setResponsesStatus(msgData.responsesGiven);
          break;

        case 'vo.FromPlayer.PageNavigationRequest':
          this.snackBar.open(
            this.translateService.instant(
              'workspace.player-send-page-navigation-request',
              { target: msgData.newPage }
            ),
            '',
            { duration: 3000 }
          );
          this.gotoPage({ action: msgData.newPage });
          break;

        case 'vopPageNavigationCommand':
          this.snackBar.open(
            this.translateService.instant(
              'workspace.player-send-page-navigation-request',
              { target: msgData.target }
            ),
            '',
            { duration: 3000 }
          );
          this.gotoPage({ action: msgData.target });
          break;

        case 'vo.FromPlayer.UnitNavigationRequest':
          this.snackBar.open(
            this.translateService.instant(
              'workspace.player-send-unit-navigation-request',
              { target: msgData.navigationTarget }
            ),
            '',
            { duration: 3000 }
          );
          break;

        case 'vopUnitNavigationRequestedNotification':
          this.snackBar.open(
            this.translateService.instant(
              'workspace.player-send-unit-navigation-request',
              { target: msgData.target }
            ),
            '',
            { duration: 3000 }
          );
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
  }

  sendChangeData(): void {
    this.sendUnitDefinition(
      this.workspaceService.selectedUnit$.getValue(),
      this.workspaceService.getUnitDefinitionStore()
    );
  }

  onLoadUnitProperties() {
    this.setPresentationStatus('none');
    this.setResponsesStatus('none');
    this.setPageList([], '');
    this.getVeronaModuleId(
      this.workspaceService.getUnitMetadataStore(),
      'player'
    )
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(playerId => {
        if (playerId) {
          if (playerId === this.lastVeronaModulId && this.postMessageTarget) {
            this.sendUnitDefinition(
              this.workspaceService.selectedUnit$.getValue(),
              this.workspaceService.getUnitDefinitionStore()
            );
          } else {
            this.postMessageTarget = undefined;
            this.buildVeronaModule(playerId, 'player');
            this.playerName = playerId;
            // player gets unit data via ReadyNotification
          }
        } else {
          this.message = this.translateService.instant('workspace.no-player');
          this.postMessageTarget = undefined;
        }
      });
  }

  postStore(unitDefinitionStore: UnitDefinitionStore): void {
    const unitDef = unitDefinitionStore.getData();
    if (this.postMessageTarget) {
      if (this.playerApiVersion === 1) {
        this.postMessageTarget.postMessage(
          {
            type: 'vo.ToPlayer.DataTransfer',
            sessionId: this.sessionId,
            unitDefinition: unitDef.definition ? unitDef.definition : ''
          },
          '*'
        );
      } else {
        this.postMessageTarget.postMessage(
          {
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
          },
          '*'
        );
      }
      this.unitLoaded.next(true);
    }
  }

  private postPlayerConfigChangedNotificationMessage(): void {
    this.postMessageTarget?.postMessage(
      {
        type: 'vopPlayerConfigChangedNotification',
        sessionId: this.sessionId,
        playerConfig: {
          pagingMode: this.previewService.pagingMode.value
        }
      },
      '*'
    );
  }

  postNavigationDenied(): void {
    if (this.postMessageTarget) {
      this.postMessageTarget.postMessage(
        {
          type: 'vopNavigationDeniedNotification',
          sessionId: this.sessionId,
          reason: ['presentationIncomplete', 'responsesIncomplete']
        },
        '*'
      );
    }
  }

  // ++++++++++++ page nav ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  setPageList(validPages?: string[], currentPage?: string): void {
    if (validPages instanceof Array) {
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
    } else if (this.pageList.length > 1 && currentPage !== undefined) {
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
        this.pageList[this.pageList.length - 1].disabled =
          currentPageIndex === this.pageList.length - 2;
      }
    }
  }

  gotoPage(target: { action: string; index?: number }): void {
    const action = target.action;
    const index = target.index || 0;
    let nextPageId = '';
    // currentpage is detected by disabled-attribute of page
    if (action === '#next') {
      let currentPageIndex = 0;
      for (let i = 0; i < this.pageList.length; i++) {
        if (this.pageList[i].index > 0 && this.pageList[i].disabled) {
          currentPageIndex = i;
          break;
        }
      }
      if (currentPageIndex > 0 && currentPageIndex < this.pageList.length - 2) {
        nextPageId = this.pageList[currentPageIndex + 1].id;
      }
    } else if (action === '#previous') {
      let currentPageIndex = 0;
      for (let i = 0; i < this.pageList.length; i++) {
        if (this.pageList[i].index > 0 && this.pageList[i].disabled) {
          currentPageIndex = i;
          break;
        }
      }
      if (currentPageIndex > 1) {
        nextPageId = this.pageList[currentPageIndex - 1].id;
      }
    } else if (action === '#goto') {
      if (index > 0 && index < this.pageList.length - 1) {
        nextPageId = this.pageList[index].id;
      }
    } else if (index === 0) {
      // call from player
      nextPageId = action;
    }

    if (nextPageId.length > 0 && this.postMessageTarget) {
      if (this.playerApiVersion === 1) {
        this.postMessageTarget.postMessage(
          {
            type: 'vo.ToPlayer.NavigateToPage',
            sessionId: this.sessionId,
            newPage: nextPageId
          },
          '*'
        );
      } else {
        this.postMessageTarget.postMessage(
          {
            type: 'vopPageNavigationCommand',
            sessionId: this.sessionId,
            target: nextPageId
          },
          '*'
        );
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

  async checkCodingChanged() {
    if (this.workspaceService.isChanged()) {
      this.snackBar.open(
        this.translateService.instant('workspace.save-unit-before-check'),
        this.translateService.instant('workspace.error'),
        { duration: 3000 }
      );
    } else {
      this.backendService
        .getUnitScheme(
          this.workspaceService.selectedWorkspaceId,
          this.workspaceService.selectedUnit$.getValue()
        )
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(schemeData => {
          this.checkCoding(schemeData);
        });
    }
  }

  showPrintOptions(): void {
    if (this.workspaceService.isChanged()) {
      this.snackBar.open(
        this.translateService.instant('workspace.save-unit-before-check'),
        this.translateService.instant('workspace.error'),
        { duration: 3000 }
      );
    } else {
      const dialogRef = this.dialog.open(PrintOptionsDialogComponent);
      dialogRef
        .afterClosed()
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(result => {
          if (result) {
            this.openPrintView(result);
          }
        });
    }
  }

  openPrintView(options: { key: string; value: boolean | number }[]): void {
    const printOptions = options
      .filter(
        (option: { key: string; value: boolean | number }) => option.value === true
      )
      .map((option: { key: string; value: boolean | number }) => option.key);
    const printPreviewHeight =
      options.find(option => option.key === 'printPreviewHeight')?.value || 0;
    const url = this.router.serializeUrl(
      this.router.createUrlTree(['/print'], {
        queryParams: {
          printPreviewHeight: printPreviewHeight,
          printOptions: printOptions,
          unitIds: [this.workspaceService.selectedUnit$.getValue()],
          workspaceId: this.workspaceService.selectedWorkspaceId,
          workspaceGroupId: this.workspaceService.groupId
        }
      })
    );
    window.open(`#${url}`, '_blank');
  }

  private checkCoding(schemeData: UnitSchemeDto | null): void {
    let codingScheme: CodingScheme;
    const responses = this.getResponses();
    if (schemeData) {
      codingScheme = JSON.parse(schemeData.scheme);
      if (codingScheme === null) {
        if (responses) {
          this.dialog
            .open(ShowResponsesComponent, {
              data: {
                responses: responses,
                table: this.isIqbStandardResponse()
              },
              height: '80%',
              width: '60%'
            })
            .afterClosed()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(() => {});
        } else {
          this.snackBar.open(
            this.translateService.instant('workspace.coding-check-error'),
            this.translateService.instant('workspace.error'),
            { duration: 3000 }
          );
        }
        return;
      }
      this.workspaceService.codingScheme = codingScheme;
      const varsWithCodes = codingScheme.variableCodings
        .filter(vc => vc.codes.length > 0)
        .map(vc => (vc.alias ? vc.alias : vc.id));
      const newResponses = CodingSchemeFactory.code(
        responses!,
        this.workspaceService.codingScheme.variableCodings
      );
      this.showCodingResults(newResponses, varsWithCodes);
    }
  }

  private showCodingResults(
    responses: Response[],
    varsWithCodes: string[]
  ): void {
    this.dialog
      .open(ShowCodingResultsComponent, {
        data: { responses: responses, varsWithCodes: varsWithCodes },
        height: '80%',
        width: '60%'
      })
      .afterClosed()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => {});
  }
}
