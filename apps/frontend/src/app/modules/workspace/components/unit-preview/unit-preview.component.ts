import {
  Component, ElementRef, signal, ViewChild
} from '@angular/core';
import {
  forkJoin, from, map, Observable, of, shareReplay, skip, takeUntil, tap
} from 'rxjs';
import { UnitDependency } from '@studio-lite/shared-code';
import { MatDialog } from '@angular/material/dialog';
import { ShowCodingResultsComponent } from '@iqb/ngx-coding-components';
import { UnitSchemeDto } from '@studio-lite-lib/api-dto';
import { CodingSchemeData } from '@iqbspecs/coding-scheme/coding-scheme.interface';
import { CodingSchemeFactory } from '@iqb/responses';
import { Response } from '@iqbspecs/response/response.interface';
import { Router } from '@angular/router';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { PreviewService } from '../../services/preview.service';
import { UnitDefinitionStore } from '../../classes/unit-definition-store';
import { ShowResponsesComponent } from '../show-responses/show-responses.component';
import { PreviewBarComponent } from '../preview-bar/preview-bar.component';
import {
  PrintOptionsDialogComponent
} from '../../../print/components/print-options-dialog/print-options-dialog.component';
import { PreviewDirective } from '../../../../directives/preview.directive';
import { UnitState } from '../../../../models/verona.interface';
import { TrackIframeActivityDirective } from '../../../../directives/track-iframe-activity.directive';
import { matchDefinitionType, playerRejectsDefinitionType } from '../../utils/definition-type-match.utils';
import { findMissingDependencies } from '../../utils/missing-dependencies.utils';

/**
 * The preview in the workspace: the unit as a test taker would see it, running in the player the
 * unit names. It follows the definition store, so an edit next door is shown without a save, and it
 * keeps the responses the player reports for the state display beside it.
 */
@Component({
  templateUrl: './unit-preview.component.html',
  styleUrls: ['./unit-preview.component.scss'],
  host: { class: 'unit-preview' },
  imports: [PreviewBarComponent, MatProgressSpinner, TrackIframeActivityDirective]
})
export class UnitPreviewComponent extends PreviewDirective {
  @ViewChild('hostingIframe') hostingIframe!: ElementRef;
  definitionTypeWarning = '';
  /** What the unit needs to be played that the studio does not have (#1602); empty when nothing. */
  readonly dependencyWarning = signal('');
  private installedDependencies$?: Observable<{ packages: string[]; widgets: string[] } | null>;
  private dataParts!: Record<string, string> | null;
  private unitStateDataType: string | null = null;

  constructor(
    public previewService: PreviewService,
    public override errorDialog: MatDialog,
    private router: Router
  ) {
    super();
  }

  protected startSubscriptions(): void {
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
      this.definitionTypeWarning = '';
      this.dependencyWarning.set('');
      this.workspaceService
        .loadUnitProperties()
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(() => this.onLoadUnitProperties());
    } else {
      this.renewSubscriptions();
    }
  }

  sendChangeData(): void {
    this.sendUnitDefinition(this.workspaceService.selectedUnit$.getValue());
  }

  private subscribeForVeronaModuleLoaded(): void {
    this.getVeronaModuleId(
      this.unitStores.metadataStore(),
      'player'
    )
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(playerId => {
        // also when there is none: the bar named the player of the unit before (#2085)
        this.playerName = playerId;
        this.showVeronaModule(playerId, 'player', () => this.sendChangeData());
      });
  }

  onLoadUnitProperties(): void {
    this.setPresentationStatus('none');
    this.setResponsesStatus('none');
    this.clearPageList();
    this.subscribeForVeronaModuleLoaded();
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
      this.definitionTypeWarning = this.getDefinitionTypeWarning(unitDef.definitionType);
      this.updateDependencyWarning(unitDef.dependenciesToPlay);
      this.awaitPageListAfterRestart();
      this.awaitProgressAfterRestart();
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
              presentationProgress: this.toPlayerValue('none'),
              responseProgress: this.toPlayerValue('none')
            },
            playerConfig: {
              ...this.legacyStateReportPolicy(),
              pagingMode: this.toPlayerValue(this.previewService.pagingMode.value),
              directDownloadUrl: this.backendService.getDirectDownloadLink(),
              sharedParameters: this.sharedParameters
            },
            // a unit without a definition sends none, as the testcenter does, not an empty one (#719)
            ...(unitDef.definition && { unitDefinition: unitDef.definition }),
            ...(unitDef.definitionType && { unitDefinitionType: unitDef.definitionType })
          },
          '*'
        );
      }
      this.unitLoaded.next(true);
    }
  }

  /**
   * A warning when the player says of itself that it does not read the format the unit is written
   * in, naming the installed players that say they do. Empty whenever either side is silent: the
   * player still runs, and an author decides whether to switch it (#1368).
   */
  private getDefinitionTypeWarning(definitionType: string | undefined): string {
    const player = this.moduleService.players[this.playerName];
    if (!playerRejectsDefinitionType(definitionType, player)) return '';
    const alternatives = Object.values(this.moduleService.players)
      .filter(module => matchDefinitionType(definitionType, module.metadata?.model) === 'compatible')
      .map(module => module.nameAndVersion);
    const warning = this.translateService.instant(
      'workspace.definition-type-incompatible',
      { player: player.nameAndVersion, definitionType }
    );
    const hint = alternatives.length > 0 ?
      this.translateService.instant('workspace.definition-type-alternatives', { players: alternatives.join(', ') }) :
      this.translateService.instant('workspace.definition-type-no-alternative');
    return `${warning} ${hint}`;
  }

  /**
   * A warning when the unit needs, to be played, a resource package, a widget or another file the
   * studio does not have (#1602). The player still runs; it may only show part of the unit. Nothing
   * is said when the packages cannot be read, and nothing for a unit left before they arrived.
   */
  private updateDependencyWarning(dependencies: UnitDependency[] | undefined): void {
    this.dependencyWarning.set('');
    if (!dependencies?.length) return;
    const unitId = this.workspaceService.selectedUnit$.getValue();
    this.loadInstalledDependencies()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(installed => {
        if (!installed || this.workspaceService.selectedUnit$.getValue() !== unitId) return;
        const missing = findMissingDependencies(dependencies, installed.packages, installed.widgets);
        // one whole sentence per kind, with only the names put in: the word order differs between languages
        const sentences = ([
          ['workspace.dependencies-missing-packages', missing.packages],
          ['workspace.dependencies-missing-widgets', missing.widgets],
          ['workspace.dependencies-missing-files', missing.files]
        ] as const)
          .filter(([, names]) => names.length > 0)
          .map(([key, names]) => this.translateService.instant(key, { names: names.join(', ') }));
        if (sentences.length === 0) return;
        sentences.push(this.translateService.instant('workspace.dependencies-missing-hint'));
        // packages and widgets can be installed; other files the studio does not keep at all
        if (missing.packages.length > 0 || missing.widgets.length > 0) {
          sentences.push(this.translateService.instant('workspace.dependencies-missing-install-hint'));
        }
        this.dependencyWarning.set(sentences.join(' '));
      });
  }

  /**
   * The installed packages and widget types, read once for the preview. A failed read is not kept:
   * the next unit asks again rather than going without a warning for the rest of the session.
   */
  private loadInstalledDependencies(): Observable<{ packages: string[]; widgets: string[] } | null> {
    this.installedDependencies$ ??= forkJoin([
      this.backendService.getResourcePackages(),
      Object.keys(this.moduleService.widgets).length === 0 ? from(this.moduleService.loadWidgets()) : of(undefined)
    ]).pipe(
      map(([packages]) => (packages ?
        {
          packages: packages.map(resourcePackage => resourcePackage.name),
          widgets: Object.values(this.moduleService.widgets).map(widget => widget.metadata?.model ?? '')
        } :
        null)),
      tap(installed => {
        if (!installed) this.installedDependencies$ = undefined;
      }),
      shareReplay(1)
    );
    return this.installedDependencies$;
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
        playerConfig: { pagingMode: this.toPlayerValue(this.previewService.pagingMode.value) }
      },
      '*'
    );
  }

  postNavigationDenied(): void {
    this.postMessageTarget?.postMessage(
      {
        type: 'vopNavigationDeniedNotification',
        sessionId: this.sessionId,
        reason: ['presentationIncomplete', 'responsesIncomplete'].map(reason => this.toPlayerValue(reason))
      },
      '*'
    );
  }

  /**
   * Codes the player's responses with the coding scheme as it is now, saved or not -- the player
   * beside it shows the definition as it is now too, and saving first is no longer asked (#1361).
   */
  async checkCodingChanged(): Promise<void> {
    this.unitStores
      .loadSchemeStore(this.workspaceService.selectedWorkspaceId, this.workspaceService.selectedUnit$.getValue())
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(unitSchemeStore => this.checkCoding(unitSchemeStore?.getData() ?? null));
  }

  showPrintOptions(): void {
    if (this.unitStores.changed()) {
      this.snackBar.open(
        this.translateService.instant('workspace.save-unit-before-check'),
        this.translateService.instant('workspace.error'),
        { duration: 3000 }
      );
    } else {
      this.errorDialog
        .open(PrintOptionsDialogComponent)
        .afterClosed()
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((result: { key: string; value: boolean | number }[]) => {
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
      const codingScheme: CodingSchemeData = JSON.parse(schemeData.scheme);
      if (!codingScheme) {
        if (responses) {
          this.errorDialog.open(ShowResponsesComponent, {
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
      const varsWithCodes = codingScheme.variableCodings
        .filter(vc => vc.codes && vc.codes.length > 0)
        .map(vc => vc.alias || vc.id);
      // Before the player has reported anything, the scheme's variables are shown without values (#1848).
      const newResponses = CodingSchemeFactory.code(
        responses ?? [],
        codingScheme.variableCodings
      );
      this.errorDialog.open(ShowCodingResultsComponent, {
        data: {
          responses: newResponses,
          varsWithCodes,
          variableCodings: codingScheme.variableCodings
        },
        height: '80%',
        width: '60%'
      });
    }
  }
}
