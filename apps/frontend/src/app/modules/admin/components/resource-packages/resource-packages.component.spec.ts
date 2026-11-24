import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { ResourcePackageDto } from '@studio-lite-lib/api-dto';
import { ConfirmDialogData, MessageDialogData } from '@studio-lite-lib/iqb-components';
import { BackendService as ReadBackendService } from '../../../../services/backend.service';
import { BackendService as WriteBackendService } from '../../services/backend.service';
import { ResourcePackagesComponent } from './resource-packages.component';

describe('ResourcePackagesComponent', () => {
  let component: ResourcePackagesComponent;
  let fixture: ComponentFixture<ResourcePackagesComponent>;
  let readBackendService: jest.Mocked<Pick<ReadBackendService, 'getResourcePackages' | 'getResourcePackageDefaults'>>;
  let writeBackendService: jest.Mocked<Pick<WriteBackendService,
  'deleteResourcePackages' | 'getResourcePackageGroups' | 'setResourcePackageDefaults' | 'setResourcePackageName'>>;
  let snackBar: jest.Mocked<Pick<MatSnackBar, 'open'>>;
  let dialog: jest.Mocked<Pick<MatDialog, 'open'>>;
  let translateService: TranslateService;

  const geogebra = (id: number, name: string): ResourcePackageDto => (
    {
      id, name, packageName: 'GeoGebra', elements: []
    }
  );
  const closingWith = (result: unknown) => (
    { afterClosed: () => of(result) } as MatDialogRef<unknown, unknown>
  );

  beforeEach(async () => {
    readBackendService = {
      getResourcePackages: jest.fn()
        .mockReturnValue(of([geogebra(1, 'GeoGebra-5.0.791'), geogebra(2, 'GeoGebra-5.3')])),
      getResourcePackageDefaults: jest.fn().mockReturnValue(of({ GeoGebra: 'GeoGebra-5.0.791' }))
    };
    writeBackendService = {
      deleteResourcePackages: jest.fn(),
      getResourcePackageGroups: jest.fn().mockReturnValue(of([
        { id: 1, name: 'Mathe', chosenResourcePackages: { GeoGebra: 'GeoGebra-5.0.791' } },
        { id: 2, name: 'Physik' },
        { id: 3, name: 'Chemie', chosenResourcePackages: {} }
      ])),
      setResourcePackageDefaults: jest.fn().mockReturnValue(of(true)),
      setResourcePackageName: jest.fn().mockReturnValue(of(true))
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
    jest.spyOn(translateService, 'instant').mockImplementation((key: string | string[], params?: object) => (
      `${Array.isArray(key) ? key.join(',') : key}${params ? JSON.stringify(params) : ''}`
    ));

    fixture = TestBed.createComponent(ResourcePackagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('does not delete when dialog is canceled', () => {
    dialog.open.mockReturnValue(closingWith(false));

    component.selectedResourcePackages.next([2]);
    component.deleteSelected();

    expect(writeBackendService.deleteResourcePackages).not.toHaveBeenCalled();
  });

  it('should say why a package in use cannot be deleted, and delete nothing of the selection (#1358)', () => {
    component.selectedResourcePackages.next([1, 2]);
    component.deleteSelected();

    expect(dialog.open).toHaveBeenCalledTimes(1);
    const { content } = dialog.open.mock.calls[0][1]?.data as MessageDialogData;
    expect(content).toBe([
      'resource-packages.delete-in-use{"name":"GeoGebra-5.0.791"}',
      'resource-packages.use-default{"packageName":"GeoGebra"}',
      'resource-packages.use-groups{"groups":"Mathe"}'
    ].join(' '));
    expect(writeBackendService.deleteResourcePackages).not.toHaveBeenCalled();
  });

  it('deletes selected and refreshes list on confirm', () => {
    dialog.open.mockReturnValue(closingWith(true));
    writeBackendService.deleteResourcePackages.mockReturnValue(of(true));
    readBackendService.getResourcePackages.mockClear();

    component.selectedResourcePackages.next([2, 3]);
    component.deleteSelected();

    expect(writeBackendService.deleteResourcePackages).toHaveBeenCalledWith([2, 3]);
    expect(readBackendService.getResourcePackages).toHaveBeenCalled();
  });

  describe('upload (#1358)', () => {
    const chooseFile = (name: string) => {
      const input = { files: [new File(['zip'], name)], value: name } as unknown as HTMLInputElement;
      jest.spyOn(component.fileUploadQueue, 'add');
      component.uploadSelected(input);
      return input;
    };

    it('should upload with the package name the dialog gave', () => {
      dialog.open.mockReturnValue(closingWith({ packageName: 'Geo Gebra', overwrite: false }));

      const input = chooseFile('GeoGebra-6.0.itcr.zip');

      expect(component.uploadUrl()).toBe('http://server/resource-packages?packageName=Geo+Gebra');
      expect(component.fileUploadQueue.add).toHaveBeenCalledWith(input.files?.[0]);
      expect(input.value).toBe('');
    });

    it('should overwrite only when the dialog says so', () => {
      dialog.open.mockReturnValue(closingWith({ packageName: 'GeoGebra', overwrite: true }));

      chooseFile('GeoGebra-5.3.itcr.zip');

      expect(component.uploadUrl()).toBe('http://server/resource-packages?packageName=GeoGebra&overwrite=true');
    });

    it('should upload nothing when the dialog is canceled', () => {
      dialog.open.mockReturnValue(closingWith(undefined));

      chooseFile('GeoGebra-6.0.itcr.zip');

      expect(component.fileUploadQueue.add).not.toHaveBeenCalled();
    });
  });

  describe('setDefault (#1358)', () => {
    it('should name the groups that switch, and set the default on confirm only', () => {
      dialog.open.mockReturnValue(closingWith(true));

      component.setDefault(geogebra(2, 'GeoGebra-5.3'));

      const data = dialog.open.mock.calls[0][1]?.data as ConfirmDialogData;
      // Mathe chose a package of its own; Physik and Chemie follow the default
      expect(data.content).toContain('"groups":"Physik, Chemie"');
      expect(writeBackendService.setResourcePackageDefaults).toHaveBeenCalledWith({ GeoGebra: 'GeoGebra-5.3' });
    });

    it('should leave the default alone when the dialog is dismissed', () => {
      dialog.open.mockReturnValue(closingWith(undefined));

      component.setDefault(geogebra(2, 'GeoGebra-5.3'));

      expect(writeBackendService.setResourcePackageDefaults).not.toHaveBeenCalled();
    });
  });

  // a dialog without them would say that the step reaches no group
  it('should open no dialog when the groups cannot be read (#1358)', () => {
    writeBackendService.getResourcePackageGroups.mockReturnValue(of(null));

    component.setDefault(geogebra(2, 'GeoGebra-5.3'));

    expect(dialog.open).not.toHaveBeenCalled();
  });

  it('should give a package the package name the dialog gave (#1358)', () => {
    dialog.open.mockReturnValue(closingWith({ packageName: 'GeoGebra3D', overwrite: false }));

    component.editPackageName(geogebra(2, 'GeoGebra-5.3'));

    expect(writeBackendService.setResourcePackageName).toHaveBeenCalledWith(2, 'GeoGebra3D');
  });
});
