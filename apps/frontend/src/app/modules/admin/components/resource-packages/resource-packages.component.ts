import {
  Component, Inject, OnDestroy, OnInit
} from '@angular/core';
import {
  BehaviorSubject, Observable, Subject, switchMap, takeUntil, tap
} from 'rxjs';
import { ResourcePackageDto } from '@studio-lite-lib/api-dto';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AsyncPipe } from '@angular/common';
import { MatTooltip } from '@angular/material/tooltip';
import { MatButton } from '@angular/material/button';
import { IqbFilesUploadQueueComponent, IqbFilesUploadInputForDirective } from '@studio-lite-lib/iqb-components';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BackendService as ReadBackendService } from '../../../../services/backend.service';
import { BackendService as WriteBackendService } from '../../services/backend.service';
import { TableDataSourcePipe } from '../../pipes/table-data-source.pipe';
import { ResourcePackagesTableComponent } from '../resource-packages-table/resource-packages-table.component';
import { WrappedIconComponent } from '../../../shared/components/wrapped-icon/wrapped-icon.component';
import { DeleteDialogComponent } from '../../../shared/components/delete-dialog/delete-dialog.component';

@Component({
  selector: 'studio-lite-resource-packages',
  templateUrl: './resource-packages.component.html',
  styleUrls: ['./resource-packages.component.scss'],
  // eslint-disable-next-line max-len
  imports: [IqbFilesUploadInputForDirective, MatButton, MatTooltip, WrappedIconComponent, IqbFilesUploadQueueComponent, ResourcePackagesTableComponent, AsyncPipe, TranslateModule, TableDataSourcePipe]
})

export class ResourcePackagesComponent implements OnInit, OnDestroy {
  resourcePackages!: Observable<ResourcePackageDto[]>;
  selectedResourcePackages: BehaviorSubject<number[]> = new BehaviorSubject<number[]>([]);
  private ngUnsubscribe = new Subject<void>();

  constructor(
    @Inject('SERVER_URL') public serverUrl: string,
    private writeBackendService: WriteBackendService,
    private readBackendService: ReadBackendService,
    private translateService: TranslateService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
  }

  ngOnInit(): void {
    this.updateFormFields();
  }

  updateFormFields(): void {
    this.resourcePackages = this.readBackendService.getResourcePackages();
  }

  deleteSelected(): void {
    const unitsToDelete = this.selectedResourcePackages.value;

    const titleKey = unitsToDelete.length === 1 ?
      'admin.delete-one-package' : 'admin.delete-many-packages';
    const contentKey = unitsToDelete.length === 1 ?
      'admin.delete-one-package-confirmation' : 'admin.delete-many-packages-confirmation';

    this.dialog.open(DeleteDialogComponent, {
      width: '400px',
      data: {
        title: this.translateService
          .instant(titleKey, { count: unitsToDelete.length }),
        content: this.translateService
          .instant(contentKey, { count: unitsToDelete.length })
      }
    })
      .afterClosed()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(confirmed => {
        if (!confirmed) return;
        this.resourcePackages = this.writeBackendService
          .deleteResourcePackages(this.selectedResourcePackages.value)
          .pipe(
            switchMap(() => this.readBackendService
              .getResourcePackages()
              .pipe(tap(packages => {
                if (packages) {
                  this.snackBar.open(
                    this.translateService.instant('admin.package-deleted'),
                    '',
                    { duration: 1000 }
                  );
                } else {
                  this.snackBar.open(
                    this.translateService.instant('admin.package-not-deleted'),
                    this.translateService.instant('admin.error'),
                    { duration: 3000 }
                  );
                }
              }))));
      });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
