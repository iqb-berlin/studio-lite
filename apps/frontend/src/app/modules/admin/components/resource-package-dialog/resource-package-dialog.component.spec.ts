import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { ResourcePackageDto } from '@studio-lite-lib/api-dto';
import {
  ResourcePackageDialogComponent, ResourcePackageDialogData
} from './resource-package-dialog.component';

describe('ResourcePackageDialogComponent', () => {
  const geogebra = (id: number, name: string): ResourcePackageDto => (
    {
      id, name, packageName: 'GeoGebra', elements: []
    }
  );
  const installed = [geogebra(1, 'GeoGebra-5.0.791'), geogebra(2, 'GeoGebra-5.3')];
  const groups = [
    { id: 1, name: 'Mathe', chosenResourcePackages: { GeoGebra: 'GeoGebra-5.3' } },
    { id: 2, name: 'Physik' }
  ];
  const close = jest.fn();

  const open = (data: Partial<ResourcePackageDialogData>) => {
    TestBed.configureTestingModule({
      imports: [ResourcePackageDialogComponent, TranslateModule.forRoot()],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            packages: installed, defaults: { GeoGebra: 'GeoGebra-5.0.791' }, groups, ...data
          }
        },
        { provide: MatDialogRef, useValue: { close } }
      ]
    });
    const fixture = TestBed.createComponent(ResourcePackageDialogComponent);
    fixture.detectChanges();
    return fixture.componentInstance;
  };

  beforeEach(() => close.mockClear());

  it('should suggest the package name the file name gives and hand back the name entered (#1358)', () => {
    const dialog = open({ fileName: 'GeoGebra-6.0.itcr.zip' });

    expect(dialog.packageName.value).toBe('GeoGebra');
    expect(dialog.replaced).toBeUndefined();
    expect(dialog.becomesDefault()).toBe(false);

    dialog.packageName.setValue(' GeoGebra3D ');
    expect(dialog.becomesDefault()).toBe(true);
    dialog.confirm();

    expect(close).toHaveBeenCalledWith({ packageName: 'GeoGebra3D', overwrite: false });
  });

  it('should tell whom an overwritten package changes for, and keep its package name', () => {
    const dialog = open({ fileName: 'GeoGebra-5.3.itcr.zip' });

    expect(dialog.replaced?.name).toBe('GeoGebra-5.3');
    expect(dialog.reachedGroups).toBe('Mathe');
    expect(dialog.packageName.disabled).toBe(true);
    expect(dialog.confirmKey).toBe('resource-packages.overwrite');
    dialog.confirm();

    expect(close).toHaveBeenCalledWith({ packageName: 'GeoGebra', overwrite: true });
  });

  it('should let a package in use get its package name spelt otherwise only', () => {
    const dialog = open({ resourcePackage: installed[0] });

    expect(dialog.useTexts).toEqual([{ key: 'resource-packages.use-default', params: { packageName: 'GeoGebra' } }]);
    expect(dialog.blocked()).toBe(false);
    dialog.packageName.setValue('GeoGebra3D');
    expect(dialog.blocked()).toBe(true);
    // nothing to promise while the name cannot be saved
    expect(dialog.becomesDefault()).toBe(false);
    dialog.packageName.setValue('geogebra');
    expect(dialog.blocked()).toBe(false);
    expect(dialog.becomesDefault()).toBe(false);
  });

  it('should let a package not in use get another name, and say when it becomes a default there', () => {
    const dialog = open({ resourcePackage: installed[1], groups: [] });

    expect(dialog.useTexts).toEqual([]);
    expect(dialog.becomesDefault()).toBe(false);
    dialog.packageName.setValue('GeoGebra3D');

    expect(dialog.becomesDefault()).toBe(true);
    expect(dialog.confirmKey).toBe('save');
  });

  it('should refuse an empty package name or one with a slash', () => {
    const dialog = open({ fileName: 'avatar.itcr.zip' });

    expect(dialog.packageName.value).toBe('avatar');
    dialog.packageName.setValue('  ');
    expect(dialog.packageName.invalid).toBe(true);
    dialog.packageName.setValue('a/b');
    expect(dialog.packageName.invalid).toBe(true);
  });
});
