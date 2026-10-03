import { TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { MatDialogRef } from '@angular/material/dialog';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import {
  BehaviorSubject, of, Subject, throwError
} from 'rxjs';
import { saveAs } from 'file-saver-es';
import { ExportCodingBookComponent } from './export-coding-book.component';
import { WorkspaceBackendService } from '../../services/workspace-backend.service';
import { WorkspaceService } from '../../services/workspace.service';
import { AppService } from '../../../../services/app.service';
import { I18nService } from '../../../../services/i18n.service';

jest.mock('file-saver-es', () => ({ saveAs: jest.fn() }));

describe('Studio shared codebook wrapper', () => {
  const backend = { getUnitList: jest.fn(), getMissingsProfiles: jest.fn(), getCodingBook: jest.fn() };
  const workspace = {
    isChanged: jest.fn(() => false), selectedWorkspaceId: 1, selectedWorkspaceName: 'Studio', selectedUnit$: new BehaviorSubject(7)
  };
  const app = { dataLoading: false };
  const dialog = { close: jest.fn() };
  beforeEach(async () => {
    jest.clearAllMocks(); workspace.isChanged.mockReturnValue(false); app.dataLoading = false;
    backend.getUnitList.mockReturnValue(of([{ id: 7, key: 'U', name: 'Aufgabe' }]));
    backend.getMissingsProfiles.mockReturnValue(of([{ id: 8, label: 'Profil' }]));
    await TestBed.configureTestingModule({
      imports: [ExportCodingBookComponent, TranslateModule.forRoot()],
      providers: [provideNoopAnimations(), { provide: WorkspaceBackendService, useValue: backend },
        { provide: WorkspaceService, useValue: workspace }, { provide: AppService, useValue: app },
        { provide: I18nService, useValue: { fullLocale: 'en-US', fileDateFormat: 'yyyy-MM-dd' } },
        { provide: MatDialogRef, useValue: dialog }]
    }).compileComponents();
  });

  it('renders the shared Studio form and preselects the active unit', () => {
    const fixture = TestBed.createComponent(ExportCodingBookComponent); fixture.detectChanges();
    expect(fixture.componentInstance.unitList).toEqual([7]);
    expect(fixture.nativeElement.querySelector('ngx-codebook-export')).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('Aufgabe');
    fixture.destroy();
  });

  it('uses only the direct endpoint, downloads once and resets loading', () => {
    const fixture = TestBed.createComponent(ExportCodingBookComponent); fixture.detectChanges();
    const c = fixture.componentInstance;
    backend.getCodingBook.mockReturnValue(of(new Blob(['document'])));
    c.exportCodingBook({ selectedUnits: [7], missingsProfileId: 8, contentOptions: { ...c.contentOptions, missingsProfile: 'Profil' } });
    expect(backend.getCodingBook).toHaveBeenCalledWith(1, 'Profil', expect.objectContaining({ missingsProfile: 'Profil' }), [7]);
    expect(saveAs).toHaveBeenCalledTimes(1); expect(app.dataLoading).toBe(false);
    expect(dialog.close).toHaveBeenCalledWith({ selectedUnits: [7] }); fixture.destroy();
  });

  it('retains the dialog and clears loading after failure or a null result', () => {
    const fixture = TestBed.createComponent(ExportCodingBookComponent); const c = fixture.componentInstance;
    [throwError(() => new Error('HTTP')), of(null)].forEach(response => {
      backend.getCodingBook.mockReturnValue(response);
      c.exportCodingBook({ selectedUnits: [7], missingsProfileId: 0, contentOptions: c.contentOptions });
      expect(c.error).toBe(true); expect(c.exporting).toBe(false); expect(app.dataLoading).toBe(false);
    });
    expect(dialog.close).not.toHaveBeenCalled(); fixture.destroy();
  });

  it('blocks unsaved changes and repeated exports', () => {
    const fixture = TestBed.createComponent(ExportCodingBookComponent); const c = fixture.componentInstance;
    const config = { selectedUnits: [7], missingsProfileId: 0, contentOptions: c.contentOptions };
    workspace.isChanged.mockReturnValue(true); c.exportCodingBook(config);
    expect(backend.getCodingBook).not.toHaveBeenCalled(); workspace.isChanged.mockReturnValue(false);
    backend.getCodingBook.mockReturnValue(new Subject()); c.exportCodingBook(config); c.exportCodingBook(config);
    expect(backend.getCodingBook).toHaveBeenCalledTimes(1); fixture.destroy(); expect(app.dataLoading).toBe(false);
  });
});
