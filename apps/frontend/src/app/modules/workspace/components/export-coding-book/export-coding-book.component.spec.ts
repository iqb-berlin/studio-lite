/* eslint-disable @typescript-eslint/lines-between-class-members */
/* eslint-disable lines-between-class-members */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable max-classes-per-file */
/* eslint-disable class-methods-use-this */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { provideHttpClient } from '@angular/common/http';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { Component, Input } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { BehaviorSubject, of } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ExportCodingBookComponent } from './export-coding-book.component';
import { WorkspaceBackendService } from '../../services/workspace-backend.service';
import { WorkspaceService } from '../../services/workspace.service';
import { AppService } from '../../../../services/app.service';
import { I18nService } from '../../../../services/i18n.service';
import { SelectUnitListComponent } from '../select-unit-list/select-unit-list.component';

describe('ExportCodingBookComponent', () => {
  let component: ExportCodingBookComponent;
  let fixture: ComponentFixture<ExportCodingBookComponent>;

  @Component({ selector: 'studio-lite-select-unit-list', template: '', standalone: true })
  class MockSelectUnitListComponent {
    @Input() disabled!: number[];

    @Input() filter!: number[];

    @Input() initialSelection!: number[];

    @Input() workspace!: unknown;

    @Input() showGroups!: boolean;

    @Input() selectionCount!: number;

    @Input() selectedUnitId!: number;
  }

  class MockWorkspaceBackendService {
    getMissingsProfiles() {
      return of([
        { label: 'profile1', missings: '[]' },
        { label: 'profile2', missings: '[]' }
      ]);
    }

    getUnitList() {
      return of([]);
    }

    getCodingBook() {
      // Return a blob/buffer mock
      return of(new Blob(['test-data'], { type: 'application/json' }));
    }
  }

  class MockWorkspaceService {
    isChanged() {
      return false;
    }

    selectedWorkspaceId = 1;

    selectedWorkspaceName = 'ws';

    selectedUnit$ = new BehaviorSubject<number>(0);
  }

  class MockAppService {
    dataLoading = false;
  }

  class MockI18nService {
    fullLocale = 'en-US';

    fileDateFormat = 'yyyy-MM-dd';
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MatDialogModule,
        MatExpansionModule,
        TranslateModule.forRoot(),
        MockSelectUnitListComponent // Add directly to imports ensures it is available
      ],
      providers: [
        provideHttpClient(),
        {
          provide: 'SERVER_URL',
          useValue: environment.backendUrl
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {}
        },
        { provide: WorkspaceBackendService, useClass: MockWorkspaceBackendService },
        { provide: WorkspaceService, useClass: MockWorkspaceService },
        { provide: AppService, useClass: MockAppService },
        { provide: I18nService, useClass: MockI18nService }
      ]
    })
      .overrideComponent(ExportCodingBookComponent, {
        remove: { imports: [SelectUnitListComponent] },
        add: { imports: [MockSelectUnitListComponent] }
      })
      .compileComponents();

    fixture = TestBed.createComponent(ExportCodingBookComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should fetch missing profiles and set them', () => {
      // ngOnInit is called during setup (fixture.detectChanges())
      expect(component.missingsProfiles).toEqual(['profile1', 'profile2']);
    });
  });

  describe('selectionCount', () => {
    it('should return the length of unitList', () => {
      expect(component.selectionCount).toBe(0);
      component.unitList = [1, 2, 3];
      expect(component.selectionCount).toBe(3);
    });
  });

  describe('exportCodingBook', () => {
    it('should fetch coding book data and trigger download', async () => {
      const backendSvc = TestBed.inject(WorkspaceBackendService);
      const appSvc = TestBed.inject(AppService);
      const getCodingBookSpy = jest.spyOn(backendSvc, 'getCodingBook');

      const saveAsSpy = jest.spyOn(await import('file-saver-es'), 'saveAs')
        .mockImplementation(() => {});

      component.unitList = [1, 2];
      component.selectedMissingsProfile = 'profile1';
      component.contentOptions.exportFormat = 'json';

      component.exportCodingBook();

      expect(getCodingBookSpy).toHaveBeenCalledWith(
        1, // selectedWorkspaceId from MockWorkspaceService
        'profile1',
        component.contentOptions,
        [1, 2]
      );

      // Because we mock getCodingBook to return `of(new Blob...)`, the subscribe callback
      // triggers synchronously.
      expect(appSvc.dataLoading).toBe(false);
      expect(saveAsSpy).toHaveBeenCalled();

      const saveAsArgs = saveAsSpy.mock.calls[0];
      expect(saveAsArgs[0]).toBeInstanceOf(Blob);
      // Date string format depends on the pipe but should end in .json
      expect(saveAsArgs[1]).toMatch(/ Codebook ws\.json$/);

      saveAsSpy.mockRestore();
    });
  });
});
