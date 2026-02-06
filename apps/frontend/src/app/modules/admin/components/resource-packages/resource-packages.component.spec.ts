import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { BackendService as ReadBackendService } from '../../../../services/backend.service';
import { BackendService as WriteBackendService } from '../../services/backend.service';
import { ResourcePackagesComponent } from './resource-packages.component';

describe('ResourcePackagesComponent', () => {
  let component: ResourcePackagesComponent;
  let fixture: ComponentFixture<ResourcePackagesComponent>;
  let readBackendService: jest.Mocked<Pick<ReadBackendService, 'getResourcePackages'>>;
  let writeBackendService: jest.Mocked<Pick<WriteBackendService, 'deleteResourcePackages'>>;
  let snackBar: jest.Mocked<Pick<MatSnackBar, 'open'>>;
  let dialog: jest.Mocked<Pick<MatDialog, 'open'>>;
  let translateService: TranslateService;

  beforeEach(async () => {
    readBackendService = {
      getResourcePackages: jest.fn()
    };
    writeBackendService = {
      deleteResourcePackages: jest.fn()
    };
    snackBar = {
      open: jest.fn()
    };
    dialog = {
      open: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: ReadBackendService, useValue: readBackendService },
        { provide: WriteBackendService, useValue: writeBackendService },
        { provide: MatSnackBar, useValue: snackBar },
        { provide: MatDialog, useValue: dialog },
        { provide: 'SERVER_URL', useValue: 'http://server/' }
      ]
    }).compileComponents();

    translateService = TestBed.inject(TranslateService);
    jest.spyOn(translateService, 'instant').mockImplementation((key: string | string[]) => (
      Array.isArray(key) ? key.join(',') : key
    ));

    readBackendService.getResourcePackages.mockReturnValue(of([]));

    fixture = TestBed.createComponent(ResourcePackagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('updates resourcePackages on updateFormFields', () => {
    const packages$ = of([]);
    readBackendService.getResourcePackages.mockReturnValue(packages$);

    component.updateFormFields();

    expect(component.resourcePackages).toBe(packages$);
  });

  it('does not delete when dialog is canceled', () => {
    const dialogRef: Pick<MatDialogRef<unknown, boolean>, 'afterClosed'> = {
      afterClosed: () => of(false)
    };
    dialog.open.mockReturnValue(dialogRef as MatDialogRef<unknown, boolean>);

    component.selectedResourcePackages.next([1]);
    component.deleteSelected();

    expect(writeBackendService.deleteResourcePackages).not.toHaveBeenCalled();
  });

  it('deletes selected and refreshes list on confirm', () => {
    const dialogRef: Pick<MatDialogRef<unknown, boolean>, 'afterClosed'> = {
      afterClosed: () => of(true)
    };
    dialog.open.mockReturnValue(dialogRef as MatDialogRef<unknown, boolean>);
    writeBackendService.deleteResourcePackages.mockReturnValue(of(true));
    const refreshedPackages$ = of([]);
    readBackendService.getResourcePackages.mockReturnValue(refreshedPackages$);

    component.selectedResourcePackages.next([2, 3]);
    component.deleteSelected();

    expect(writeBackendService.deleteResourcePackages).toHaveBeenCalledWith([2, 3]);
    expect(readBackendService.getResourcePackages).toHaveBeenCalled();
    expect(component.resourcePackages).toBeDefined();
  });
});
