/* eslint-disable max-classes-per-file */
import {
  ComponentFixture, fakeAsync, TestBed, tick
} from '@angular/core/testing';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { provideHttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { UnitExportContentsDto } from '@studio-lite-lib/api-dto';
import { environment } from '../../../../../environments/environment';
import { ExportUnitFileConfigComponent } from './export-unit-file-config.component';
import { WorkspaceService } from '../../services/workspace.service';
import { ModuleService } from '../../../../services/module.service';
import { WorkspaceBackendService } from '../../services/workspace-backend.service';
import { ExportFileSelection } from '../../utils/export-file-options.utils';

class MockWorkspaceService {
  selectedWorkspaceId = 1;
}

class MockModuleService {
  players = {};
}

const unitWithComments: UnitExportContentsDto = {
  unitId: 1, metadata: false, items: false, codingScheme: false, comments: true, richNotes: false
};

class MockWorkspaceBackendService {
  exportContents: Observable<UnitExportContentsDto[] | null> = of([unitWithComments]);

  // eslint-disable-next-line class-methods-use-this
  getUnitListWithProperties() {
    return of([]);
  }

  getUnitExportContents() {
    return this.exportContents;
  }
}

describe('ExportUnitFileConfigComponent', () => {
  let component: ExportUnitFileConfigComponent;
  let fixture: ComponentFixture<ExportUnitFileConfigComponent>;
  let backendService: MockWorkspaceBackendService;
  let emitted: ExportFileSelection[];

  const checkbox = (flag: string): HTMLElement | null => fixture.nativeElement
    .querySelector(`[data-cy="export-file-${flag}"]`);
  const isDisabled = (flag: string): boolean => !!checkbox(flag)
    ?.querySelector('input')?.disabled;

  const create = (selectedUnitIds: number[], format: 'xml' | 'json' = 'xml') => {
    fixture = TestBed.createComponent(ExportUnitFileConfigComponent);
    component = fixture.componentInstance;
    emitted = [];
    component.fileSelectionChange.subscribe(selection => emitted.push(selection));
    fixture.componentRef.setInput('exportFormat', format);
    fixture.componentRef.setInput('selectedUnitIds', selectedUnitIds);
    fixture.detectChanges();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MatSelectModule,
        MatInputModule,
        FormsModule,
        MatFormFieldModule,
        MatCheckboxModule,
        MatDialogModule,
        TranslateModule.forRoot()
      ],
      providers: [
        provideHttpClient(),
        {
          provide: 'SERVER_URL',
          useValue: environment.backendUrl
        },
        { provide: WorkspaceService, useClass: MockWorkspaceService },
        { provide: ModuleService, useClass: MockModuleService },
        { provide: WorkspaceBackendService, useClass: MockWorkspaceBackendService }
      ]
    }).compileComponents();
    backendService = TestBed.inject(WorkspaceBackendService) as unknown as MockWorkspaceBackendService;
  });

  it('should create', () => {
    create([]);
    expect(component).toBeTruthy();
  });

  it('should default exportFormat to json', () => {
    fixture = TestBed.createComponent(ExportUnitFileConfigComponent);
    expect(fixture.componentInstance.exportFormat).toBe('json');
  });

  it('should emit exportFormatChange when format changes', () => {
    create([]);
    jest.spyOn(component.exportFormatChange, 'emit');
    component.exportFormatChange.emit('xml');
    expect(component.exportFormatChange.emit).toHaveBeenCalledWith('xml');
  });

  it('should offer and check a file one of the chosen units has content for', () => {
    create([1]);

    expect(isDisabled('addComments')).toBe(false);
    expect(emitted.at(-1)).toMatchObject({ addComments: true, addMetadata: false, addCodingScheme: false });
  });

  // ngModel hands `disabled` to the checkbox a microtask later, hence tick() before reading it
  it('should lock a file none of the chosen units has content for, with a hint', fakeAsync(() => {
    create([1]);
    tick();
    fixture.detectChanges();

    expect(isDisabled('addMetadata')).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('unit-download.no-metadata-and-items');
  }));

  it('should follow the selection', fakeAsync(() => {
    create([]);
    tick();
    fixture.detectChanges();
    expect(isDisabled('addComments')).toBe(true);

    fixture.componentRef.setInput('selectedUnitIds', [1]);
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    expect(isDisabled('addComments')).toBe(false);
    expect(emitted.at(-1)).toMatchObject({ addComments: true });
  }));

  it('should keep a box unchecked by hand while the selection changes', () => {
    create([1]);
    component.setFileChecked(component.fileStates.find(state => state.option.flag === 'addComments')!, false);

    fixture.componentRef.setInput('selectedUnitIds', [1, 2]);
    fixture.detectChanges();

    expect(emitted.at(-1)).toMatchObject({ addComments: false });
  });

  it('should show the items option of its own only in JSON', () => {
    create([1], 'json');
    expect(checkbox('addItems')).not.toBeNull();

    fixture.componentRef.setInput('exportFormat', 'xml');
    fixture.detectChanges();
    expect(checkbox('addItems')).toBeNull();
  });

  it('should emit nothing before the contents are known', () => {
    backendService.exportContents = new Observable<UnitExportContentsDto[] | null>();
    create([1]);

    expect(emitted).toEqual([]);
    expect(checkbox('addComments')).toBeNull();
  });

  it('should offer every file when the contents cannot be read', fakeAsync(() => {
    backendService.exportContents = of(null);
    create([1]);
    tick();
    fixture.detectChanges();

    expect(isDisabled('addMetadata')).toBe(false);
    expect(emitted.at(-1)).toEqual({
      addMetadata: true, addCodingScheme: true, addComments: false, addRichNotes: false
    });
  }));
});
