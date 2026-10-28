// eslint-disable-next-line max-classes-per-file
import {
  ComponentFixture, fakeAsync, TestBed, tick
} from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { BookletConfigDto } from '@studio-lite-lib/api-dto';
import { MatExpansionModule, MatExpansionPanel } from '@angular/material/expansion';
import { provideHttpClient } from '@angular/common/http';
import { By } from '@angular/platform-browser';
import { ExportUnitComponent } from './export-unit.component';
import { environment } from '../../../../../environments/environment';
import { SelectUnitListComponent } from '../select-unit-list/select-unit-list.component';
import { ExportTestTakerConfigComponent } from '../export-test-taker-config/export-test-taker-config.component';
import { BookletConfigEditComponent } from '../booklet-config-edit/booklet-config-edit.component';
import { ExportUnitFileConfigComponent } from '../export-unit-file-config/export-unit-file-config.component';
import { ExportFileSelection } from '../../utils/export-file-options.utils';

describe('ExportUnitComponent', () => {
  let component: ExportUnitComponent;
  let fixture: ComponentFixture<ExportUnitComponent>;

  @Component({ selector: 'studio-lite-select-unit-list', template: '', standalone: true })
  class MockSelectUnitListComponent {
    @Input() disabled!: number[];
    @Input() filter!: number[];
    @Input() initialSelection!: number[];
    @Input() workspace!: unknown;
    @Input() showGroups!: boolean;
    @Input() selectionCount!: number;
    @Input() selectedUnitId!: number;
    @Output() selectionChanged = new EventEmitter<number[]>();
  }

  @Component({ selector: 'studio-lite-export-test-taker-config', template: '', standalone: true })
  class MockTestConfigComponent {
    @Input() addTestTakersReview!: number;
    @Input() addTestTakersHot!: number;
    @Input() addTestTakersMonitor!: number;
    @Input() passwordLess!: boolean;
    @Output() addTestTakersReviewChange = new EventEmitter<number>();
    @Output() addTestTakersHotChange = new EventEmitter<number>();
    @Output() addTestTakersMonitorChange = new EventEmitter<number>();
    @Output() passwordLessChange = new EventEmitter<boolean>();
  }

  @Component({ selector: 'studio-lite-booklet-config-edit', template: '', standalone: true })
  class MockBookletConfigComponent {
    @Input() disabled!: boolean;
    @Input() config!: BookletConfigDto | undefined;
    @Input() context!: 'review' | 'export';
    @Output() configChanged = new EventEmitter<BookletConfigDto>();
  }

  @Component({ selector: 'studio-lite-export-unit-file-config', template: '', standalone: true })
  class MockExportUnitFileConfigComponent {
    @Input() exportFormat: 'xml' | 'json' = 'json';
    @Input() selectedUnitIds: number[] = [];
    @Input() addPlayers!: boolean;
    @Output() exportFormatChange = new EventEmitter<'xml' | 'json'>();
    @Output() addPlayersChange = new EventEmitter<boolean>();
    @Output() fileSelectionChange = new EventEmitter<ExportFileSelection>();
    @Output() unitsWithOutPlayerChange = new EventEmitter<number[]>();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MatDialogModule,
        MatExpansionModule,
        TranslateModule.forRoot(),
        MockSelectUnitListComponent,
        MockTestConfigComponent,
        MockBookletConfigComponent,
        MockExportUnitFileConfigComponent
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
        }
      ]
    })
      .overrideComponent(ExportUnitComponent, {
        remove: {
          imports: [
            SelectUnitListComponent,
            ExportTestTakerConfigComponent,
            BookletConfigEditComponent,
            ExportUnitFileConfigComponent
          ]
        },
        add: {
          imports: [
            MockSelectUnitListComponent,
            MockTestConfigComponent,
            MockBookletConfigComponent,
            MockExportUnitFileConfigComponent
          ]
        }
      })
      .compileComponents();

    fixture = TestBed.createComponent(ExportUnitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should pass the export format down and adopt changes from the file config', () => {
    const fileConfig = fixture.debugElement
      .query(By.directive(MockExportUnitFileConfigComponent))
      .componentInstance as MockExportUnitFileConfigComponent;
    expect(fileConfig.exportFormat).toBe('xml');

    fileConfig.exportFormatChange.emit('json');
    fixture.detectChanges();

    expect(component.unitExportSettings.exportFormat).toBe('json');
    expect(fileConfig.exportFormat).toBe('json');
  });

  // The testcenter reads units only as XML (#1477)
  it('should drop the logins and lock their panel for the JSON format', () => {
    const fileConfig = fixture.debugElement
      .query(By.directive(MockExportUnitFileConfigComponent))
      .componentInstance as MockExportUnitFileConfigComponent;
    component.unitExportSettings.addTestTakersReview = 1;
    component.unitExportSettings.addTestTakersHot = 2;
    component.unitExportSettings.addTestTakersMonitor = 3;

    fileConfig.exportFormatChange.emit('json');
    fixture.detectChanges();

    const panel = fixture.debugElement.query(By.css('[data-cy="export-test-taker-panel"]'))
      .injector.get(MatExpansionPanel);
    expect(component.unitExportSettings.addTestTakersReview).toBe(0);
    expect(component.unitExportSettings.addTestTakersHot).toBe(0);
    expect(component.unitExportSettings.addTestTakersMonitor).toBe(0);
    expect(panel.disabled).toBe(true);
    expect(panel.expanded).toBe(false);

    fileConfig.exportFormatChange.emit('xml');
    fixture.detectChanges();

    expect(panel.disabled).toBe(false);
    expect(panel.expanded).toBe(true);
  });

  it('should point out that logins without players need the players in the testcenter', () => {
    const hint = () => fixture.debugElement.query(By.css('[data-cy="export-test-takers-without-players"]'));
    expect(hint()).toBeNull();

    component.unitExportSettings.addTestTakersHot = 1;
    fixture.detectChanges();
    expect(hint()).not.toBeNull();

    component.unitExportSettings.addPlayers = true;
    fixture.detectChanges();
    expect(hint()).toBeNull();
  });

  // The export would otherwise replace the characters silently (UnitDownloadClass.safeBookletId)
  it('should not download a booklet id the export would have to rewrite', fakeAsync(() => {
    const input = fixture.debugElement.query(By.css('input[name="bookletId"]')).nativeElement as HTMLInputElement;
    const button = fixture.debugElement.query(By.css('[data-cy="workspace-export-unit-button"]'))
      .nativeElement as HTMLButtonElement;
    const enterBookletId = (id: string) => {
      input.value = id;
      input.dispatchEvent(new Event('input'));
      tick();
      fixture.detectChanges();
    };
    component.unitExportSettings.unitIdList = [1];
    component.unitExportSettings.addTestTakersHot = 1;

    enterBookletId('Heft_1-a');
    expect(button.disabled).toBe(false);

    enterBookletId('Heft 1');
    expect(button.disabled).toBe(true);
    // shown while the field still has the focus, not only once it is left
    expect(fixture.nativeElement.querySelector('mat-error')?.textContent)
      .toContain('unit-download.dialog.booklet-id-pattern');

    enterBookletId('Heft-ä');
    expect(button.disabled).toBe(true);
  }));

  it('should pass the unit selection on to the file config', () => {
    const unitList = fixture.debugElement
      .query(By.directive(MockSelectUnitListComponent))
      .componentInstance as MockSelectUnitListComponent;
    const fileConfig = fixture.debugElement
      .query(By.directive(MockExportUnitFileConfigComponent))
      .componentInstance as MockExportUnitFileConfigComponent;

    unitList.selectionChanged.emit([3, 7]);
    fixture.detectChanges();

    expect(fileConfig.selectedUnitIds).toEqual([3, 7]);
  });

  it('should disable units without a player in the unit list', () => {
    const unitList = fixture.debugElement
      .query(By.directive(MockSelectUnitListComponent))
      .componentInstance as MockSelectUnitListComponent;
    const fileConfig = fixture.debugElement
      .query(By.directive(MockExportUnitFileConfigComponent))
      .componentInstance as MockExportUnitFileConfigComponent;

    fileConfig.unitsWithOutPlayerChange.emit([5]);

    expect(unitList.disabled).toEqual([5]);
  });

  it('should adopt the file config flags', () => {
    const fileConfig = fixture.debugElement
      .query(By.directive(MockExportUnitFileConfigComponent))
      .componentInstance as MockExportUnitFileConfigComponent;

    fileConfig.addPlayersChange.emit(true);
    fileConfig.fileSelectionChange.emit({
      addMetadata: false, addCodingScheme: true, addComments: true, addRichNotes: true
    });

    expect(component.unitExportSettings.addPlayers).toBe(true);
    expect(component.unitExportSettings.addMetadata).toBe(false);
    expect(component.unitExportSettings.addCodingScheme).toBe(true);
    expect(component.unitExportSettings.addComments).toBe(true);
    expect(component.unitExportSettings.addRichNotes).toBe(true);
  });

  it('should leave the files that became optional unset until the file config decides', () => {
    expect(component.unitExportSettings).not.toHaveProperty('addMetadata');
    expect(component.unitExportSettings).not.toHaveProperty('addItems');
    expect(component.unitExportSettings).not.toHaveProperty('addCodingScheme');
  });

  it('should adopt the test taker settings', () => {
    const testTakerConfig = fixture.debugElement
      .query(By.directive(MockTestConfigComponent))
      .componentInstance as MockTestConfigComponent;

    testTakerConfig.addTestTakersReviewChange.emit(1);
    testTakerConfig.addTestTakersHotChange.emit(2);
    testTakerConfig.addTestTakersMonitorChange.emit(3);
    testTakerConfig.passwordLessChange.emit(true);

    expect(component.unitExportSettings.addTestTakersReview).toBe(1);
    expect(component.unitExportSettings.addTestTakersHot).toBe(2);
    expect(component.unitExportSettings.addTestTakersMonitor).toBe(3);
    expect(component.unitExportSettings.passwordLess).toBe(true);
  });

  it('should map the booklet config when the booklet config edit reports a change', () => {
    const bookletConfig = fixture.debugElement
      .query(By.directive(MockBookletConfigComponent))
      .componentInstance as MockBookletConfigComponent;

    bookletConfig.configChanged.emit({ unitTitle: 'ON' });

    expect(component.unitExportSettings.bookletSettings.map(s => s.key)).toContain('toolbar_show_unit_title');
  });

  it('should map booklet config to modern keys on setBookletConfigSettings', () => {
    component.setBookletConfigSettings({
      unitScreenHeader: 'WITH_BOOKLET_TITLE',
      unitTitle: 'ON',
      unitNaviButtons: 'FULL',
      controllerDesign: '2022'
    });
    const keys = component.unitExportSettings.bookletSettings.map(s => s.key);
    expect(keys).toContain('header_content');
    expect(keys).toContain('toolbar_show_unit_title');
    expect(keys).toContain('navbar_unit_controls_hidden');
    expect(keys).not.toContain('controller_design');
    expect(keys).not.toContain('unit_screenheader');
  });

  it('should map unitScreenHeader OFF to header_content NONE, not header_hidden', () => {
    component.setBookletConfigSettings({ unitScreenHeader: 'OFF' });
    const settings = component.unitExportSettings.bookletSettings;
    const headerContent = settings.find(s => s.key === 'header_content');
    expect(headerContent?.value).toBe('NONE');
    expect(settings.some(s => s.key === 'header_hidden')).toBe(false);
  });

  it('should map unitScreenHeader EMPTY to header_content NONE', () => {
    component.setBookletConfigSettings({ unitScreenHeader: 'EMPTY' });
    const settings = component.unitExportSettings.bookletSettings;
    const headerContent = settings.find(s => s.key === 'header_content');
    expect(headerContent?.value).toBe('NONE');
    expect(settings.some(s => s.key === 'header_hidden')).toBe(false);
  });
});
