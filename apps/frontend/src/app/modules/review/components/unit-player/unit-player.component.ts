import {
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  AfterViewInit
} from '@angular/core';
import { takeUntil } from 'rxjs';
import { ActivatedRoute, Params } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { VeronaModuleFactory } from '@studio-lite/shared-code';

import { TranslateService } from '@ngx-translate/core';
import { ModuleService } from '../../../shared/services/module.service';
import { AppService } from '../../../../services/app.service';
import { ReviewService } from '../../services/review.service';
import { PageData } from '../../../workspace/models/page-data.interface';
import { UnitData } from '../../models/unit-data.class';
import { ReviewBackendService } from '../../services/review-backend.service';
import { PageNavigationComponent } from '../../../shared/components/page-navigation/page-navigation.component';
import { UnitInfoComponent } from '../unit-info/unit-info.component';
import { VeronaModuleDirective } from '../../../workspace/directives/verona-module.directive';
import { WorkspaceBackendService } from '../../../workspace/services/workspace-backend.service';
import { WorkspaceService } from '../../../workspace/services/workspace.service';
import { Progress } from '../../../workspace/models/types';

@Component({
  selector: 'studio-lite-unit-player',
  templateUrl: './unit-player.component.html',
  styleUrls: ['./unit-player.component.scss'],
  imports: [UnitInfoComponent, PageNavigationComponent]
})
export class UnitPlayerComponent
  extends VeronaModuleDirective
  implements AfterViewInit, OnDestroy {
  @ViewChild('hostingIframe') hostingIframe!: ElementRef;

  playerName = '';
  playerApiVersion = 3;
  pageList: PageData[] = [];
  presentationProgress: Progress = 'none';
  responseProgress: Progress = 'none';
  hasFocus = false;

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
    public snackBar: MatSnackBar,
    public backendService: WorkspaceBackendService,
    private reviewBackendService: ReviewBackendService,
    public appService: AppService,
    public moduleService: ModuleService,
    public workspaceService: WorkspaceService,
    public reviewService: ReviewService,
    public translateService: TranslateService
  ) {
    super();
  }

  ngAfterViewInit(): void {
    this.iFrameElement = this.hostingIframe.nativeElement;
    this.subscribeForPostMessages();
    this.subscribeForRouteChanges();
  }

  private subscribeForRouteChanges(): void {
    setTimeout(() => {
      this.route.params
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(params => this.onRouteChange(params));
    });
  }

  private onRouteChange(params: Params): void {
    const unitKey = 'u';
    this.reviewService.currentUnitSequenceId = parseInt(params[unitKey], 10);
    if (this.reviewService.units.length === 0) {
      this.reviewService
        .loadReviewData()
        .then(() => this.onSelectedUnitChange());
    } else {
      this.onSelectedUnitChange();
    }
  }

  // Wird aufgerufen, wenn die Unit im Review gewechselt wird
  onSelectedUnitChange(): void {
    const unitData = this.reviewService.units.find(
      u => u.sequenceId === this.reviewService.currentUnitSequenceId
    );
    if (unitData) {
      this.unitData = unitData;
      this.onLoadUnitProperties();
    }
  }

  // Entspricht UnitPreview: Lädt Player-Metadaten und triggert Player-Build
  onLoadUnitProperties(): void {
    this.setPageList([], '');
    this.setPresentationStatus('none');
    this.setResponsesStatus('none');

    this.reviewBackendService
      .getUnitProperties(this.reviewService.reviewId, this.unitData.databaseId)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(umd => {
        if (umd) {
          this.unitData.dbMetadata = umd;
          const playerId = umd.player ?
            VeronaModuleFactory.getBestMatch(
              umd.player,
              Object.keys(this.moduleService.players)
            ) :
            '';
          this.playerName = playerId;
          this.unitData.name = `${this.unitData.sequenceId + 1}: ${umd.key}${
            umd.name ? ` - ${umd.name}` : ''
          }`;
          this.reviewService.setHeaderText(this.unitData.name);

          if (playerId) {
            if (playerId === this.lastVeronaModulId && this.postMessageTarget) {
              this.loadAndSendUnitDefinition();
            } else {
              this.postMessageTarget = undefined;
              this.buildVeronaModule(playerId, 'player');
            }
          } else {
            this.message = this.translateService.instant('workspace.no-player');
            this.postMessageTarget = undefined;
          }
        }
      });
  }

  // Kombiniert das Laden der Definition und das Senden an den Player
  private loadAndSendUnitDefinition(): void {
    if (this.unitData.definition) {
      this.postStore(this.unitData.definition);
    } else {
      this.reviewBackendService
        .getUnitDefinition(
          this.reviewService.reviewId,
          this.unitData.databaseId
        )
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(ued => {
          if (ued) {
            this.unitData.definition = ued.definition || '';
            this.postStore(this.unitData.definition);
          } else {
            this.snackBar.open(
              this.translateService.instant(
                'workspace.unit-definition-not-loaded'
              ),
              '',
              { duration: 3000 }
            );
          }
        });
    }
  }

  // Implementation der abstrakten Methode aus VeronaModuleDirective
  // Hier wird der String direkt gesendet, da wir im Review keinen UnitDefinitionStore verwalten
  postStore(definition: string): void {
    if (!this.postMessageTarget) return;

    if (this.playerApiVersion === 1) {
      this.postMessageTarget.postMessage(
        {
          type: 'vo.ToPlayer.DataTransfer',
          sessionId: this.sessionId,
          unitDefinition: definition || ''
        },
        '*'
      );
    } else {
      this.postMessageTarget.postMessage(
        {
          type: 'vopStartCommand',
          sessionId: this.sessionId,
          unitState: {
            dataParts: this.unitData.responses || {},
            presentationProgress: 'none',
            responseProgress: 'none'
          },
          playerConfig: {
            stateReportPolicy: 'eager',
            pagingMode: this.reviewService.bookletConfig?.pagingMode,
            enabledNavigationTargets: [
              'next',
              'previous',
              'first',
              'last',
              'end'
            ],
            directDownloadUrl: this.backendService.getDirectDownloadLink()
          },
          unitDefinition: definition || ''
        },
        '*'
      );
    }
    this.unitLoaded.next(true);
  }

  handleIncomingMessage(m: MessageEvent): void {
    const msgData = m.data;
    const msgType = msgData.type;
    if (msgType && m.source === this.iFrameElement?.contentWindow) {
      switch (msgType) {
        case 'vopReadyNotification':
        case 'player':
        case 'vo.FromPlayer.ReadyNotification':
          this.playerApiVersion = this.detectApiVersion(msgData);
          this.sessionId = VeronaModuleDirective.getSessionId();
          this.postMessageTarget = m.source as Window;
          this.loadAndSendUnitDefinition();
          break;

        case 'vo.FromPlayer.StartedNotification':
        case 'vo.FromPlayer.ChangedDataTransfer':
          this.setPageList(msgData.validPages, msgData.currentPage);
          this.setPresentationStatus(msgData.presentationComplete);
          this.setResponsesStatus(msgData.responsesGiven);
          break;

        case 'vopStateChangedNotification':
          if (msgData.playerState) {
            const pages = msgData.playerState.validPages;
            const targets = Array.isArray(pages) ?
              pages.map((p: any) => p.id) :
              Object.keys(pages);
            this.setPageList(targets, msgData.playerState.currentPage);
          }
          if (msgData.unitState) {
            this.setPresentationStatus(msgData.unitState.presentationProgress);
            this.setResponsesStatus(msgData.unitState.responseProgress);
            if (msgData.unitState.dataParts) this.unitData.responses = msgData.unitState.dataParts;
          }
          break;

        case 'vo.FromPlayer.PageNavigationRequest':
        case 'vopPageNavigationCommand':
          const targetPage = msgData.newPage || msgData.target;
          this.gotoPage({ action: targetPage });
          break;

        case 'vo.FromPlayer.UnitNavigationRequest':
        case 'vopUnitNavigationRequestedNotification':
          this.gotoUnit(msgData.target || msgData.navigationTarget);
          break;

        case 'vopWindowFocusChangedNotification':
          this.hasFocus = msgData.hasFocus;
          break;

        default:
          console.warn(`Message ignored: ${msgType}`);
      }
    }
  }

  private detectApiVersion(msgData: any): number {
    if (msgData.type === 'vo.FromPlayer.ReadyNotification') return 1;
    const versionSource =
      msgData.metadata?.specVersion ||
      msgData.apiVersion ||
      msgData.specVersion;
    const major = versionSource?.match(/\d+/);
    return major ? Number(major[0]) : 2;
  }

  private gotoUnit(target: string): void {
    const sequenceId = this.reviewService.currentUnitSequenceId;
    switch (target) {
      case 'next':
        this.reviewService.setUnitNavigationRequest(sequenceId + 1);
        break;
      case 'previous':
        this.reviewService.setUnitNavigationRequest(sequenceId - 1);
        break;
      case 'first':
        this.reviewService.setUnitNavigationRequest(-1);
        break;
      case 'last':
      case 'end':
        this.reviewService.setUnitNavigationRequest(
          this.reviewService.units.length
        );
        break;
      default:
        this.snackBar.open(
          this.translateService.instant(
            'workspace.player-send-unit-navigation-request',
            { target }
          ),
          '',
          { duration: 3000 }
        );
    }
  }

  // ++++++++++++ Page Navigation (Identisch zu UnitPreview) +++++++++++++++++++
  setPageList(validPages?: string[], currentPage?: string): void {
    if (Array.isArray(validPages) && validPages.length > 1) {
      const newPageList: PageData[] = [];
      validPages.forEach((id, i) => {
        if (i === 0) {
          newPageList.push({
            index: -1,
            id: '#previous',
            disabled: id === currentPage,
            type: '#previous'
          });
        }
        newPageList.push({
          index: i + 1,
          id,
          disabled: id === currentPage,
          type: '#goto'
        });
        if (i === validPages.length - 1) {
          newPageList.push({
            index: -1,
            id: '#next',
            disabled: id === currentPage,
            type: '#next'
          });
        }
      });
      this.pageList = newPageList;
    } else if (this.pageList.length > 1 && currentPage !== undefined) {
      const idx = this.pageList.findIndex(
        p => p.type === '#goto' && p.id === currentPage
      );
      this.pageList.forEach(p => {
        if (p.type === '#goto') p.disabled = p.id === currentPage;
      });
      this.pageList[0].disabled = idx === 1;
      this.pageList[this.pageList.length - 1].disabled =
        idx === this.pageList.length - 2;
    }
  }

  gotoPage(target: { action: string; index?: number }): void {
    const { action, index = 0 } = target;
    let nextPageId = '';
    const currentIdx = this.pageList.findIndex(
      p => p.index > 0 && p.disabled
    );

    if (action === '#next' && currentIdx < this.pageList.length - 2) nextPageId = this.pageList[currentIdx + 1].id;
    else if (action === '#previous' && currentIdx > 1) nextPageId = this.pageList[currentIdx - 1].id;
    else if (action === '#goto' && index > 0) { nextPageId = this.pageList[index].id; } else if (index === 0) nextPageId = action;

    if (nextPageId && this.postMessageTarget) {
      const isV1 = this.playerApiVersion === 1;
      this.postMessageTarget.postMessage(
        {
          type: isV1 ?
            'vo.ToPlayer.NavigateToPage' :
            'vopPageNavigationCommand',
          sessionId: this.sessionId,
          [isV1 ? 'newPage' : 'target']: nextPageId
        },
        '*'
      );
    }
  }

  setPresentationStatus(s: string): void {
    this.presentationProgress =
      s === 'yes' || s === 'complete' || s === 'some' ?
        s === 'some' ?
          'some' :
          'complete' :
        'none';
  }

  setResponsesStatus(s: string): void {
    this.responseProgress =
      s === 'all' || s === 'complete' || s === 'yes' || s === 'some' ?
        s === 'all' || s === 'complete' ?
          'complete' :
          'some' :
        'none';
  }

  setFocusStatus(status: boolean): void {
    this.hasFocus = status;
  }
}
