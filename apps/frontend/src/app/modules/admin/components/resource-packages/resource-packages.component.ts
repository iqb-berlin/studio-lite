import { Component, Inject, OnInit } from '@angular/core';
import { BehaviorSubject, Observable, switchMap } from 'rxjs';
import { ResourcePackageDto } from '@studio-lite-lib/api-dto';
import { TranslateModule } from '@ngx-translate/core';
import { AsyncPipe } from '@angular/common';
import { MatTooltip } from '@angular/material/tooltip';
import { MatButton } from '@angular/material/button';
import { IqbFilesUploadQueueComponent, IqbFilesUploadInputForDirective } from '@studio-lite-lib/iqb-components';
import { BackendService as ReadBackendService } from '../../../../services/backend.service';
import { BackendService as WriteBackendService } from '../../services/backend.service';
import { TableDataSourcePipe } from '../../pipes/table-data-source.pipe';
import { ResourcePackagesTableComponent } from '../resource-packages-table/resource-packages-table.component';
import { WrappedIconComponent } from '../../../shared/components/wrapped-icon/wrapped-icon.component';

@Component({
  selector: 'studio-lite-resource-packages',
  templateUrl: './resource-packages.component.html',
  styleUrls: ['./resource-packages.component.scss'],
  standalone: true,
  // eslint-disable-next-line max-len
  imports: [IqbFilesUploadInputForDirective, MatButton, MatTooltip, WrappedIconComponent, IqbFilesUploadQueueComponent, ResourcePackagesTableComponent, AsyncPipe, TranslateModule, TableDataSourcePipe]
})
export class ResourcePackagesComponent implements OnInit {
  resourcePackages!: Observable<ResourcePackageDto[]>;
  selectedResourcePackages: BehaviorSubject<number[]> = new BehaviorSubject<number[]>([]);

  constructor(
    @Inject('SERVER_URL') public serverUrl: string,
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
    this.resourcePackages = this.writeBackendService.deleteResourcePackages(this.selectedResourcePackages.value)
      .pipe(
        switchMap(() => this.readBackendService.getResourcePackages())
      );
  }
}
