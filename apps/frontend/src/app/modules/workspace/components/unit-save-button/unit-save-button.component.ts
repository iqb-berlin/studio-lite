import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmDialogComponent, ConfirmDialogData } from '@studio-lite-lib/iqb-components';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { MatButton } from '@angular/material/button';
import { WorkspaceService } from '../../services/workspace.service';
import { UnitDefinitionStore } from '../../classes/unit-definition-store';
import { UnitMetadataStore } from '../../classes/unit-metadata-store';
import { UnitSchemeStore } from '../../classes/unit-scheme-store';
import { WrappedIconComponent } from '../../../shared/components/wrapped-icon/wrapped-icon.component';

@Component({
  selector: 'studio-lite-unit-save-button',
  templateUrl: './unit-save-button.component.html',
  styleUrls: ['./unit-save-button.component.scss'],
  imports: [MatButton, MatTooltip, WrappedIconComponent, MatIcon, TranslateModule]
})
export class UnitSaveButtonComponent {
  constructor(
    public workspaceService: WorkspaceService,
    private deleteConfirmDialog: MatDialog,
    private translateService: TranslateService,
    private snackBar: MatSnackBar
  ) {}

  private unitDefinitionChangeSubscription!: Subscription | null;
  private unitMetadataChangeSubscription!: Subscription | null;
  private unitSchemeChangeSubscription!: Subscription | null;
  private ngUnsubscribe = new Subject<void>();
  isValidFormKey = true;
  storesDataChanged: boolean = false;

  ngOnInit() {
    this.workspaceService.unitPropertiesChange
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(isValid => {
        this.isValidFormKey = isValid;
      });

    this.workspaceService.unitDefinitionStoreChanged
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(store => this.setUnitDefinitionChangeSubscription(store));
    this.workspaceService.unitMetadataStoreChanged
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(store => this.setUnitMetadataChangeSubscription(store));
    this.workspaceService.unitSchemeStoreChanged
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(store => this.setUnitSchemeChangeSubscription(store));
  }

  private setUnitDefinitionChangeSubscription(store: UnitDefinitionStore | undefined) {
    if (store) {
      if (this.unitDefinitionChangeSubscription) this.unitDefinitionChangeSubscription.unsubscribe();
      this.unitDefinitionChangeSubscription = store.dataChange
        .subscribe(() => this.setStoresDataChanged());
    } else {
      this.setStoresDataChanged();
      if (this.unitDefinitionChangeSubscription) {
        this.unitDefinitionChangeSubscription.unsubscribe();
        this.unitDefinitionChangeSubscription = null;
      }
    }
  }

  private setUnitSchemeChangeSubscription(store: UnitSchemeStore | undefined) {
    if (store) {
      if (this.unitSchemeChangeSubscription) this.unitSchemeChangeSubscription.unsubscribe();
      this.unitSchemeChangeSubscription = store.dataChange
        .subscribe(() => this.setStoresDataChanged());
    } else {
      this.setStoresDataChanged();
      if (this.unitSchemeChangeSubscription) {
        this.unitSchemeChangeSubscription.unsubscribe();
        this.unitSchemeChangeSubscription = null;
      }
    }
  }

  private setUnitMetadataChangeSubscription(store: UnitMetadataStore | undefined) {
    if (store) {
      if (this.unitMetadataChangeSubscription) this.unitMetadataChangeSubscription.unsubscribe();
      this.unitMetadataChangeSubscription = store.dataChange
        .subscribe(() => this.setStoresDataChanged());
    } else {
      this.setStoresDataChanged();
      if (this.unitMetadataChangeSubscription) {
        this.unitMetadataChangeSubscription.unsubscribe();
        this.unitMetadataChangeSubscription = null;
      }
    }
  }

  private setStoresDataChanged(): void {
    setTimeout(() => { this.storesDataChanged = this.workspaceService.isChanged(); });
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
        this.workspaceService.restoreUnitStores();
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
    if (this.unitDefinitionChangeSubscription) this.unitDefinitionChangeSubscription.unsubscribe();
    if (this.unitMetadataChangeSubscription) this.unitMetadataChangeSubscription.unsubscribe();
    if (this.unitSchemeChangeSubscription) this.unitSchemeChangeSubscription.unsubscribe();
  }
}
