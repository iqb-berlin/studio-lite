import { Component, Inject, OnInit } from '@angular/core';
import { BehaviorSubject, Observable, switchMap } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ResourcePackageDto } from '@studio-lite-lib/api-dto';
import { HttpParams } from '@angular/common/http';
import { BackendService as ReadBackendService } from '../../../../services/backend.service';
import { BackendService as WriteBackendService } from '../../services/backend.service';
import { TableDataSourcePipe } from '../../pipes/table-data-source.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { AsyncPipe } from '@angular/common';
import { ResourcePackagesTableComponent } from '../resource-packages-table/resource-packages-table.component';
import { IqbFilesUploadQueueComponent } from '../../../../../../../../libs/iqb-components/src/lib/iqb-files/iqbFilesUploadQueue/iqbFilesUploadQueue.component';
import { WrappedIconComponent } from '../../../shared/components/wrapped-icon/wrapped-icon.component';
import { MatTooltip } from '@angular/material/tooltip';
import { MatButton } from '@angular/material/button';
import { IqbFilesUploadInputForDirective } from '../../../../../../../../libs/iqb-components/src/lib/iqb-files/iqbFilesUploadInputFor/iqbFilesUploadInputFor.directive';

@Component({
    selector: 'studio-lite-resource-packages',
    templateUrl: './resource-packages.component.html',
    styleUrls: ['./resource-packages.component.scss'],
    standalone: true,
    imports: [IqbFilesUploadInputForDirective, MatButton, MatTooltip, WrappedIconComponent, IqbFilesUploadQueueComponent, ResourcePackagesTableComponent, AsyncPipe, TranslateModule, TableDataSourcePipe]
})
export class ResourcePackagesComponent implements OnInit {
  resourcePackages!: Observable<ResourcePackageDto[]>;
  imageError: string | null = '';
  selectedResourcePackages: BehaviorSubject<number[]> = new BehaviorSubject<number[]>([]);

  constructor(
    @Inject('SERVER_URL') public serverUrl: string,
    private snackBar: MatSnackBar,
    private writeBackendService: WriteBackendService,
    private readBackendService: ReadBackendService
  ) {
  }

  ngOnInit(): void {
    this.updateFormFields();
  }

  updateFormFields(): void {
    this.resourcePackages = this.readBackendService.getResourcePackages();
  }

  delete(id: number) {
    this.resourcePackages = this.writeBackendService.deleteResourcePackage(id)
      .pipe(
        switchMap(() => this.readBackendService.getResourcePackages())
      );
  }

  deleteSelected(): void {
    let queryParams = new HttpParams();
    this.selectedResourcePackages.value.forEach(id => { queryParams = queryParams.append('id', id); });
    this.resourcePackages = this.writeBackendService.deleteResourcePackages(queryParams)
      .pipe(
        switchMap(() => this.readBackendService.getResourcePackages())
      );
  }
}
