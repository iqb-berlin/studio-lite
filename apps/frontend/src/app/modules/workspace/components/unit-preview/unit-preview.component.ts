import {
  AfterViewInit, Component, ElementRef, ViewChild
} from '@angular/core';
import { skip, takeUntil, Subject } from 'rxjs';
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
import { AppService } from '../../../../services/app.service';
import { WorkspaceBackendService } from '../../services/workspace-backend.service';
import { WorkspaceService } from '../../services/workspace.service';
import { PreviewService } from '../../services/preview.service';
import { UnitDefinitionStore } from '../../classes/unit-definition-store';
import { ShowResponsesComponent } from '../show-responses/show-responses.component';
import { PreviewBarComponent } from '../preview-bar/preview-bar.component';
import {
  PrintOptionsDialogComponent
} from '../../../print/components/print-options-dialog/print-options-dialog.component';
import { PreviewDirective } from '../../directives/preview.directive';
import { UnitState } from '../../../shared/models/verona.interface';

@Component({
  templateUrl: './unit-preview.component.html',
  styleUrls: ['./unit-preview.component.scss'],
  host: { class: 'unit-preview' },
  imports: [PreviewBarComponent, MatProgressSpinner]
})
export class UnitPreviewComponent extends PreviewDirective implements AfterViewInit {
  @ViewChild('hostingIframe') hostingIframe!: ElementRef;
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
    this.setHostingIframe();
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
    return this.unitStateDataType ?
      this.unitStateDataType.split('@')[0] === 'iqb-standard' :
      false;
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

  onSelectedUnitChange(): void {
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

  sendChangeData(): void {
    this.sendUnitDefinition(
      this.workspaceService.selectedUnit$.getValue(),
      this.workspaceService.getUnitDefinitionStore()
    );
  }

  onLoadUnitProperties(): void {
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
            this.sendChangeData();
          } else {
            this.postMessageTarget = undefined;
            this.buildVeronaModule(playerId, 'player');
            this.playerName = playerId;
          }
        } else {
          this.message = this.translateService.instant('workspace.no-player');
          this.postMessageTarget = undefined;
        }
      });
  }

  protected handleUnitStateData(unitState: UnitState): void {
    if (unitState.dataParts) {
      this.dataParts = {
        ...(this.dataParts || {}),
        ...unitState.dataParts
      };
      this.unitStateDataType = unitState.unitStateDataType || null;
    }
  }

  postStore(unitDefinitionStore: UnitDefinitionStore): void {
    const unitDef = unitDefinitionStore.getData();
    if (this.postMessageTarget) {
      if (this.playerApiVersion === 1) {
        this.postMessageTarget.postMessage(
          {
            type: 'vo.ToPlayer.DataTransfer',
            sessionId: this.sessionId,
            unitDefinition: unitDef.definition || ''
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
            unitDefinition: unitDef.definition || ''
          },
          '*'
        );
      }
      this.unitLoaded.next(true);
    }
  }

  gotoUnit(target: string): void {
    this.snackBar.open(
      this.translateService.instant(
        'workspace.player-send-unit-navigation-request',
        { target }
      ),
      '',
      { duration: 3000 }
    );
  }

  private postPlayerConfigChangedNotificationMessage(): void {
    this.postMessageTarget?.postMessage(
      {
        type: 'vopPlayerConfigChangedNotification',
        sessionId: this.sessionId,
        playerConfig: { pagingMode: this.previewService.pagingMode.value }
      },
      '*'
    );
  }

  postNavigationDenied(): void {
    this.postMessageTarget?.postMessage(
      {
        type: 'vopNavigationDeniedNotification',
        sessionId: this.sessionId,
        reason: ['presentationIncomplete', 'responsesIncomplete']
      },
      '*'
    );
  }

  async checkCodingChanged(): Promise<void> {
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
        .subscribe(schemeData => this.checkCoding(schemeData));
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
      this.dialog
        .open(PrintOptionsDialogComponent)
        .afterClosed()
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(result => {
          if (result) this.openPrintView(result);
        });
    }
  }

  openPrintView(options: { key: string; value: boolean | number }[]): void {
    const printOptions = options
      .filter(o => o.value === true)
      .map(o => o.key);
    const printPreviewHeight =
      options.find(o => o.key === 'printPreviewHeight')?.value || 0;
    const url = this.router.serializeUrl(
      this.router.createUrlTree(['/print'], {
        queryParams: {
          printPreviewHeight,
          printOptions,
          unitIds: [this.workspaceService.selectedUnit$.getValue()],
          workspaceId: this.workspaceService.selectedWorkspaceId,
          workspaceGroupId: this.workspaceService.groupId
        }
      })
    );
    window.open(`#${url}`, '_blank');
  }

  private checkCoding(schemeData: UnitSchemeDto | null): void {
    const responses = this.getResponses();
    if (schemeData) {
      const codingScheme: CodingScheme = JSON.parse(schemeData.scheme);
      if (!codingScheme) {
        if (responses) {
          this.dialog.open(ShowResponsesComponent, {
            data: { responses, table: this.isIqbStandardResponse() },
            height: '80%',
            width: '60%'
          });
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
        .map(vc => vc.alias || vc.id);
      const newResponses = CodingSchemeFactory.code(
        responses!,
        this.workspaceService.codingScheme.variableCodings
      );
      this.dialog.open(ShowCodingResultsComponent, {
        data: { responses: newResponses, varsWithCodes },
        height: '80%',
        width: '60%'
      });
    }
  }
}
