import {
  Component, computed, inject, OnDestroy
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import {
  MatCard, MatCardContent, MatCardHeader, MatCardTitle
} from '@angular/material/card';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Observable, Subject, takeUntil } from 'rxjs';
import { ConfirmDialogComponent } from '@studio-lite-lib/iqb-components';
import { WorkspaceService } from '../../services/workspace.service';
import { WorkspaceBackendService } from '../../services/workspace-backend.service';
import { UnitStoresService } from '../../services/unit-stores.service';
import { RequestMessageDirective } from '../../directives/request-message.directive';
import { AppService } from '../../../../services/app.service';
import { ChangeResultService } from '../../../../services/change-result.service';
import { DeleteDialogComponent } from '../../../../components/delete-dialog/delete-dialog.component';
import { targetWorkspaces } from '../../utils/target-workspaces.utils';
import {
  SelectTargetWorkspaceComponent, SelectTargetWorkspaceData, SelectTargetWorkspaceResult
} from '../select-target-workspace/select-target-workspace.component';

/** A text of the card: its key and what it is filled with. */
interface TextLine {
  key: string;
  params?: Record<string, string>;
}

/**
 * What can be done with the open unit as a whole: submitting it to the drop box of the workspace and
 * returning it to where it was submitted from, copying, moving and deleting it (#2232). Each of them
 * acts on this one unit and asks first; the menu above the unit list does the same for many.
 *
 * What is offered follows the access level in the workspace, with the thresholds the menu, the list and
 * the server have: submitting and returning from commenting on, deleting and moving to the admin, and
 * copying and moving to any other workspace in which the user is admin.
 *
 * Submitting, returning, moving and deleting leave the unit first, so that the guard asks about unsaved
 * changes, and the card goes with it: the request sent afterwards is not ended with the card, or its
 * answer would not be reported.
 */
@Component({
  selector: 'studio-lite-unit-actions',
  templateUrl: './unit-actions.component.html',
  styleUrls: ['./unit-actions.component.scss'],
  imports: [MatCard, MatCardHeader, MatCardTitle, MatCardContent, MatButton, MatIcon, TranslateModule]
})
export class UnitActionsComponent extends RequestMessageDirective implements OnDestroy {
  ngUnsubscribe = new Subject<void>();

  readonly workspaceService = inject(WorkspaceService);
  readonly backendService = inject(WorkspaceBackendService);
  readonly router = inject(Router);
  readonly route = inject(ActivatedRoute);
  readonly snackBar = inject(MatSnackBar);
  readonly translateService = inject(TranslateService);
  readonly selectUnitDialog = inject(MatDialog);
  readonly uploadReportDialog = this.selectUnitDialog;
  private readonly dialog = this.selectUnitDialog;
  private readonly unitStores = inject(UnitStoresService);
  private readonly changeResult = inject(ChangeResultService);
  private readonly appService = inject(AppService);

  private readonly accessLevel = toSignal(this.workspaceService.userAccessLevel$, { initialValue: 0 });
  private readonly unitId = toSignal(this.workspaceService.selectedUnit$, { initialValue: 0 });
  // the workspaces of the user may arrive after the card, when the page is opened on a unit
  private readonly authData = toSignal(this.appService.authDataChanged, { initialValue: this.appService.authData });
  private readonly targets = computed(() => targetWorkspaces(
    this.authData().workspaces,
    this.workspaceService.selectedWorkspaceId
  ));

  /** The open unit as the list has it: with where it was submitted from. */
  readonly unit = computed(() => Object.values(this.workspaceService.units()).flat()
    .find(unit => unit.id === this.unitId()));

  readonly canSubmit = computed(() => this.accessLevel() > 0);
  readonly canDelete = computed(() => this.accessLevel() > 3);
  readonly canCopy = computed(() => this.targets().length > 0);
  readonly canMove = computed(() => this.canDelete() && this.canCopy());
  readonly shown = computed(() => this.canSubmit() || this.canCopy() || this.canDelete());

  readonly dropBoxLine = computed((): TextLine => {
    const name = this.workspaceService.dropBoxName();
    return name ? { key: 'unit-actions.drop-box', params: { name } } : { key: 'workspace.no-dropbox-defined' };
  });

  /** A unit can be returned where it was submitted to and has not been returned yet. */
  readonly returnable = computed(() => {
    const unit = this.unit();
    return !!unit?.sourceWorkspaceId && !unit.returned;
  });

  readonly sourceLine = computed((): TextLine => (this.returnable() ?
    { key: 'unit-actions.submitted-from', params: { name: this.sourceName() } } :
    { key: 'unit-actions.not-submitted-here' }));

  private readonly unitLabel = computed(() => {
    const unit = this.unit();
    if (!unit) return '';
    return unit.name ? `${unit.key} – ${unit.name}` : unit.key;
  });

  private sourceName(): string {
    return this.unit()?.sourceWorkspaceName || this.translateService.instant('workspace.unknown');
  }

  submitUnit(): void {
    const unitId = this.unitId();
    const dropBoxId = this.workspaceService.dropBoxId;
    if (!dropBoxId) return;
    const workspaceId = this.workspaceService.selectedWorkspaceId;
    this.confirm(
      'workspace.submit-unit',
      this.translateService.instant('unit-actions.submit-confirm', {
        unit: this.unitLabel(), dropBox: this.workspaceService.dropBoxName()
      }),
      'workspace.submit-units'
    ).subscribe(async confirmed => {
      if (confirmed !== true || !await this.selectUnit(0)) return;
      this.backendService.submitUnits(workspaceId, dropBoxId, [unitId]).subscribe(
        status => this.showRequestMessage(status, 'workspace.unit-not-submitted', 'workspace.unit-submitted')
      );
    });
  }

  returnUnit(): void {
    const unitId = this.unitId();
    const workspaceId = this.workspaceService.selectedWorkspaceId;
    this.confirm(
      'workspace.return-submitted-unit',
      this.translateService.instant('unit-actions.return-confirm', {
        unit: this.unitLabel(), workspace: this.sourceName()
      }),
      'workspace.return-submitted-unit'
    ).subscribe(async confirmed => {
      if (confirmed !== true || !await this.selectUnit(0)) return;
      this.backendService.returnSubmittedUnits(workspaceId, [unitId])
        .subscribe(status => this.showRequestMessage(status, 'workspace.unit-not-returned', 'workspace.unit-returned'));
    });
  }

  copyUnit(): void {
    const unitId = this.unitId();
    // the server copies what it has: what is not saved yet stays behind
    const hints = this.unitStores.changed() ? [this.translateService.instant('unit-actions.copy-saved-state')] : [];
    this.selectTarget('unit-actions.copy-title', 'unit-actions.copy', true, hints)
      .subscribe(result => {
        if (!result) return;
        this.backendService.copyUnits(result.targetWorkspaceId, [unitId], result.copyComments)
          .pipe(takeUntil(this.ngUnsubscribe))
          .subscribe(status => this.showRequestMessage(status, 'unit-actions.not-copied', 'unit-actions.copied'));
      });
  }

  moveUnit(): void {
    const unitId = this.unitId();
    const workspaceId = this.workspaceService.selectedWorkspaceId;
    // a move outside the drop box ends the submission: the unit can then no longer be returned
    const hints = this.unit()?.sourceWorkspaceId ?
      [this.translateService.instant('workspace.unit-dropbox-history-deleted')] :
      [];
    this.selectTarget('unit-actions.move-title', 'unit-actions.move', false, hints)
      .subscribe(async result => {
        if (!result || !await this.selectUnit(0)) return;
        this.backendService.moveUnits(workspaceId, [unitId], result.targetWorkspaceId)
          .subscribe(status => this.showRequestMessage(status, 'unit-actions.not-moved', 'unit-actions.moved'));
      });
  }

  deleteUnit(): void {
    const unitId = this.unitId();
    const workspaceId = this.workspaceService.selectedWorkspaceId;
    this.dialog.open(DeleteDialogComponent, {
      width: '400px',
      data: {
        title: this.translateService.instant('unit-actions.delete-title'),
        content: this.translateService.instant('unit-actions.delete-confirm', { unit: this.unitLabel() })
      }
    }).afterClosed()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(async confirmed => {
        if (confirmed !== true || !await this.selectUnit(0)) return;
        this.backendService.deleteUnits(workspaceId, [unitId])
          .subscribe(ok => {
            this.changeResult.show(ok, 'unit-actions.deleted', 'unit-actions.not-deleted', 'workspace.error');
            if (ok) this.updateUnitList();
          });
      });
  }

  private confirm(titleKey: string, content: string, confirmKey: string): Observable<unknown> {
    return this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: this.translateService.instant(titleKey),
        content,
        confirmButtonLabel: this.translateService.instant(confirmKey),
        showCancel: true
      }
    }).afterClosed().pipe(takeUntil(this.ngUnsubscribe));
  }

  private selectTarget(
    titleKey: string,
    confirmKey: string,
    commentsOption: boolean,
    hints: string[]
  ): Observable<SelectTargetWorkspaceResult | undefined> {
    return this.dialog.open(SelectTargetWorkspaceComponent, {
      width: '500px',
      data: <SelectTargetWorkspaceData>{
        title: this.translateService.instant(titleKey, { unit: this.unitLabel() }),
        confirmLabel: this.translateService.instant(confirmKey),
        workspaces: this.targets(),
        commentsOption,
        hints
      }
    }).afterClosed().pipe(takeUntil(this.ngUnsubscribe));
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
