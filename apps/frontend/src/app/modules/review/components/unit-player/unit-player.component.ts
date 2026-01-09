import {
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  AfterViewInit
} from '@angular/core';
import { takeUntil, Subject } from 'rxjs';
import { ActivatedRoute, Params } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { VeronaModuleFactory } from '@studio-lite/shared-code';
import { TranslateService } from '@ngx-translate/core';
import { ModuleService } from '../../../shared/services/module.service';
import { AppService } from '../../../../services/app.service';
import { ReviewService } from '../../services/review.service';
import { UnitData } from '../../models/unit-data.class';
import { ReviewBackendService } from '../../services/review-backend.service';
import { PageNavigationComponent } from '../../../shared/components/page-navigation/page-navigation.component';
import { UnitInfoComponent } from '../unit-info/unit-info.component';
import { PreviewDirective } from '../../../workspace/directives/preview.directive';
import { WorkspaceBackendService } from '../../../workspace/services/workspace-backend.service';
import { WorkspaceService } from '../../../workspace/services/workspace.service';
import { UnitState } from '../../../shared/models/verona.interface';

@Component({
  selector: 'studio-lite-unit-player',
  templateUrl: './unit-player.component.html',
  styleUrls: ['./unit-player.component.scss'],
  imports: [UnitInfoComponent, PageNavigationComponent]
})
export class UnitPlayerComponent
  extends PreviewDirective
  implements AfterViewInit, OnDestroy {
  @ViewChild('hostingIframe') hostingIframe!: ElementRef;
  unitData: UnitData = {
    databaseId: 0,
    sequenceId: 0,
    playerId: '',
    responses: {},
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
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(() => this.onSelectedUnitChange());
    } else {
      this.onSelectedUnitChange();
    }
  }

  onSelectedUnitChange(): void {
    if (this.unitLoaded.getValue()) {
      this.unitLoaded.next(false);
      this.message = '';
      const unitData = this.reviewService.units.find(
        u => u.sequenceId === this.reviewService.currentUnitSequenceId
      );
      if (unitData) {
        this.unitData = unitData;
        this.onLoadUnitProperties();
      }
    } else {
      this.ngUnsubscribe.next();
      this.ngUnsubscribe.complete();
      this.ngUnsubscribe = new Subject<void>();
      this.unitLoaded.next(true);
      this.subscribeForPostMessages();
      this.subscribeForRouteChanges();
    }
  }

  onLoadUnitProperties(): void {
    this.setPresentationStatus('none');
    this.setResponsesStatus('none');
    this.setPageList([], '');

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
              this.sendChangeData();
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

  sendChangeData(): void {
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

  protected handleUnitStateData(unitState: UnitState): void {
    if (unitState.dataParts) this.unitData.responses = unitState.dataParts;
  }

  gotoUnit(target: string): void {
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
}
