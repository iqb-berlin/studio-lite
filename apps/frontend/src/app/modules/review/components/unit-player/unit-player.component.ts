import { Component, ElementRef, ViewChild } from '@angular/core';
import { takeUntil } from 'rxjs';
import { ActivatedRoute, Params } from '@angular/router';
import { VeronaModuleFactory } from '@studio-lite/shared-code';
import { MatDialog } from '@angular/material/dialog';
import { ReviewService } from '../../services/review.service';
import { UnitData } from '../../models/unit-data.class';
import { ReviewBackendService } from '../../services/review-backend.service';
import { PageNavigationComponent } from '../../../../components/page-navigation/page-navigation.component';
import { UnitInfoComponent } from '../unit-info/unit-info.component';
import { PreviewDirective } from '../../../../directives/preview.directive';
import { UnitState } from '../../../../models/verona.interface';
import { TrackIframeActivityDirective } from '../../../../directives/track-iframe-activity.directive';

/**
 * The unit as a reviewer sees it: the player, the unit's information, and the page navigation. Which
 * unit is shown follows the route, so paging through a review is a navigation and can be linked to
 * and returned to.
 */
@Component({
  selector: 'studio-lite-unit-player',
  templateUrl: './unit-player.component.html',
  styleUrls: ['./unit-player.component.scss'],
  imports: [UnitInfoComponent, PageNavigationComponent, TrackIframeActivityDirective]
})
export class UnitPlayerComponent extends PreviewDirective {
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
    private reviewBackendService: ReviewBackendService,
    public reviewService: ReviewService,
    public override errorDialog: MatDialog
  ) {
    super();
  }

  protected startSubscriptions(): void {
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
      this.renewSubscriptions();
    }
  }

  private subscribeForUnitPropertiesChanges(): void {
    this.reviewBackendService
      .getUnitProperties(this.reviewService.reviewId, this.unitData.databaseId)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(unitProperties => {
        if (unitProperties) {
          this.unitData.dbMetadata = unitProperties;
          const playerId = unitProperties.player ?
            VeronaModuleFactory.getBestMatch(
              unitProperties.player,
              Object.keys(this.moduleService.players)
            ) :
            '';
          this.playerName = playerId;
          this.unitData.name = `${this.unitData.sequenceId + 1}: ${unitProperties.key}${
            unitProperties.name ? ` - ${unitProperties.name}` : ''
          }`;
          this.reviewService.setHeaderText(this.unitData.name);
          this.showVeronaModule(playerId, 'player', () => this.sendChangeData());
        }
      });
  }

  onLoadUnitProperties(): void {
    this.setPresentationStatus('none');
    this.setResponsesStatus('none');
    this.clearPageList();
    this.subscribeForUnitPropertiesChanges();
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
            this.unitData.definitionType = ued.definitionType;
            this.postStore(this.unitData.definition);
          } else {
            this.snackBar.open(
              this.translateService.instant(
                'workspace.unit-definition-not-loaded'
              ),
              this.translateService.instant('workspace.error'),
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
            presentationProgress: this.toPlayerValue('none'),
            responseProgress: this.toPlayerValue('none')
          },
          playerConfig: {
            ...this.legacyStateReportPolicy(),
            pagingMode: this.toPlayerValue(this.reviewService.bookletConfig?.pagingMode),
            enabledNavigationTargets: ['next', 'previous', 'first', 'last', 'end']
              .map(target => this.toPlayerValue(target)),
            directDownloadUrl: this.backendService.getDirectDownloadLink(),
            sharedParameters: this.sharedParameters
          },
          unitDefinition: definition || '',
          ...(this.unitData.definitionType && { unitDefinitionType: this.unitData.definitionType })
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
    // Player spec 7.0 names the target in capitals, older players in lower case (#2064); anything but a
    // string from the player gets the message for an unknown target instead of throwing.
    switch (typeof target === 'string' ? target.toLowerCase() : target) {
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
