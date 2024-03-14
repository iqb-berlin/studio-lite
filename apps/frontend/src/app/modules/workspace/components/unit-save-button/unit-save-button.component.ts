import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmDialogComponent, ConfirmDialogData } from '@studio-lite-lib/iqb-components';
import { TranslateService } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { WorkspaceService } from '../../services/workspace.service';

@Component({
  selector: 'studio-lite-unit-save-button',
  templateUrl: './unit-save-button.component.html',
  styleUrls: ['./unit-save-button.component.scss']
})
export class UnitSaveButtonComponent {
  constructor(
    public workspaceService: WorkspaceService,
    private deleteConfirmDialog: MatDialog,
    private translateService: TranslateService,
    private snackBar: MatSnackBar
  ) {}

  private ngUnsubscribe = new Subject<void>();
  isValidFormKey = true;

  ngOnInit() {
    // eslint-disable-next-line no-return-assign
    this.workspaceService.isValidFormKey.asObservable()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(isValid => { this.isValidFormKey = isValid; });
  }

  discardChanges(): void {
    const dialogRef = this.deleteConfirmDialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: <ConfirmDialogData>{
        title: this.translateService.instant('workspace.reject-changes'),
        content: this.translateService.instant('workspace.reject-unit-continue'),
        confirmButtonLabel: this.translateService.instant('workspace.reject'),
        showCancel: true
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== false) {
        if (this.workspaceService.getUnitMetadataStore()) this.workspaceService.getUnitMetadataStore()?.restore();
        if (this.workspaceService.getUnitDefinitionStore()) this.workspaceService.getUnitDefinitionStore()?.restore();
        if (this.workspaceService.getUnitSchemeStore()) this.workspaceService.getUnitSchemeStore()?.restore();
        const unitId = this.workspaceService.selectedUnit$.getValue();
        this.workspaceService.selectedUnit$.next(unitId);
      }
    });
  }

  saveUnitData(): void {
    this.workspaceService.saveUnitData().then(saveResult => {
      if (saveResult) {
        this.snackBar.open(
          this.translateService.instant('workspace.unit-saved'),
          '',
          { duration: 1000 }
        );
      } else {
        this.snackBar.open(
          this.translateService.instant('workspace.unit-not-saved'),
          this.translateService.instant('workspace.error'),
          { duration: 3000 });
      }
    });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
