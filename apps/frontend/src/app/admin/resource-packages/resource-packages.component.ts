import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ResourcePackageDto } from '@studio-lite-lib/api-dto';
import { BackendService as ReadBackendService } from '../../backend.service';
import { BackendService as WriteBackendService } from '../backend.service';

@Component({
  selector: 'studio-lite-resource-packages',
  templateUrl: './resource-packages.component.html',
  styleUrls: ['./resource-packages.component.scss']
})
export class ResourcePackagesComponent implements OnInit {
  uploadForm: UntypedFormGroup;
  resourcePackages!: Observable<ResourcePackageDto[]>;
  imageError: string | null = '';

  constructor(
    private fb: UntypedFormBuilder,
    private snackBar: MatSnackBar,
    private writeBackendService: WriteBackendService,
    private readBackendService: ReadBackendService
  ) {
    this.uploadForm = this.fb.group({});
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.updateFormFields();
    });
  }

  updateFormFields(): void {
    this.resourcePackages = this.readBackendService.getResourcePackages();
  }

  upload(fileInput: Event) {
    const fileInputEventTarget = fileInput.target as HTMLInputElement;
    if (fileInputEventTarget.files && fileInputEventTarget.files[0]) {
      const formData = new FormData();
      formData.append('resourcePackage', fileInputEventTarget.files[0]);
      this.writeBackendService.createResourcePackage(formData).subscribe(r => console.log(r));
    }
  }

  delete(id: number) {
    this.writeBackendService.deleteResourcePackage(id).subscribe(r => console.log(r));
  }
}
