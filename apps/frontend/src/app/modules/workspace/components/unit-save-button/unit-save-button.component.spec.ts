import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { createMock } from '@golevelup/ts-jest';
import { ConfirmDialogComponent } from '@studio-lite-lib/iqb-components';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { provideHttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { UnitSaveButtonComponent } from './unit-save-button.component';
import { WorkspaceBackendService } from '../../services/workspace-backend.service';
import { UnitStoresService } from '../../services/unit-stores.service';
import { WorkspaceService } from '../../services/workspace.service';

describe('UnitSaveButtonComponent', () => {
  let unitStores: UnitStoresService;

  const createButton = (): ComponentFixture<UnitSaveButtonComponent> => {
    const fixture = TestBed.createComponent(UnitSaveButtonComponent);
    fixture.detectChanges();
    return fixture;
  };

  const saveButton = (fixture: ComponentFixture<UnitSaveButtonComponent>): HTMLButtonElement => fixture
    .nativeElement.querySelector('[data-cy="workspace-unit-save-button"]');

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MatIconModule,
        MatTooltipModule,
        MatSnackBarModule,
        MatDialogModule,
        TranslateModule.forRoot()
      ],
      providers: [
        provideHttpClient(),
        {
          provide: WorkspaceBackendService,
          useValue: { getUnitProperties: jest.fn().mockReturnValue(of({ id: 1, name: 'Unit' })) }
        },
        {
          provide: 'SERVER_URL',
          useValue: environment.backendUrl
        }]
    }).compileComponents();

    unitStores = TestBed.inject(UnitStoresService);
  });

  it('should create', () => {
    expect(createButton().componentInstance).toBeTruthy();
  });

  it('is disabled while nothing is unsaved', () => {
    unitStores.loadMetadataStore(1, 1).subscribe();

    expect(saveButton(createButton()).disabled).toBe(true);
  });

  it('is enabled by a change and disabled again once it is discarded', () => {
    const fixture = createButton();
    unitStores.loadMetadataStore(1, 1).subscribe();

    unitStores.metadataStore()?.setPlayer('player@2.0');
    fixture.detectChanges();
    expect(saveButton(fixture).disabled).toBe(false);

    unitStores.restore();
    fixture.detectChanges();
    expect(saveButton(fixture).disabled).toBe(true);
  });

  // #1842: a key another unit carries blocks saving; one that only breaks the format rules does not
  it('is disabled while the key typed in the properties is taken', () => {
    const workspaceService = TestBed.inject(WorkspaceService);
    unitStores.loadMetadataStore(1, 1).subscribe();
    unitStores.metadataStore()?.setPlayer('player@2.0');
    const fixture = createButton();

    workspaceService.setUnitKeyTaken(true);
    fixture.detectChanges();
    expect(saveButton(fixture).disabled).toBe(true);

    workspaceService.setUnitKeyTaken(false);
    workspaceService.isValidFormKey.next(false);
    fixture.detectChanges();
    expect(saveButton(fixture).disabled).toBe(false);
  });

  describe('discarding the changes', () => {
    const closeDialogWith = (result: boolean | undefined) => jest
      .spyOn(TestBed.inject(MatDialog), 'open')
      .mockReturnValue(createMock<MatDialogRef<ConfirmDialogComponent>>({ afterClosed: () => of(result) }));

    beforeEach(() => {
      unitStores.loadMetadataStore(1, 1).subscribe();
      unitStores.metadataStore()?.setPlayer('player@2.0');
    });

    it('discards them once the discard button confirms', () => {
      closeDialogWith(true);

      createButton().componentInstance.discardChanges();

      expect(unitStores.changed()).toBe(false);
    });

    // Esc, a click beside the dialog and navigation close it with undefined (#1844)
    it.each([false, undefined])('keeps them when the dialog closes with %s', result => {
      closeDialogWith(result);

      createButton().componentInstance.discardChanges();

      expect(unitStores.changed()).toBe(true);
    });
  });

  // The button appears only once the user's access level is known, and the unit's properties may
  // have been loaded before that (#1290).
  it('takes notice of a store that was there before the button', () => {
    unitStores.loadMetadataStore(1, 1).subscribe();
    const fixture = createButton();

    unitStores.metadataStore()?.setPlayer('player@2.0');
    fixture.detectChanges();

    expect(saveButton(fixture).disabled).toBe(false);
  });
});
