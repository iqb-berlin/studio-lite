import { Component, Inject, OnInit } from '@angular/core';
import { BehaviorSubject, Observable, switchMap } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ResourcePackageDto } from '@studio-lite-lib/api-dto';
import { HttpParams } from '@angular/common/http';
import { BackendService as ReadBackendService } from '../../backend.service';
import { BackendService as WriteBackendService } from '../backend.service';

@Component({
  selector: 'studio-lite-resource-packages',
  templateUrl: './resource-packages.component.html',
  styleUrls: ['./resource-packages.component.scss']
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
