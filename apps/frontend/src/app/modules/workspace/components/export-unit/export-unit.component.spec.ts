// eslint-disable-next-line max-classes-per-file
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { Component, Input } from '@angular/core';
import { BookletConfigDto } from '@studio-lite-lib/api-dto';
import { MatExpansionModule } from '@angular/material/expansion';
import { provideHttpClient } from '@angular/common/http';
import { ExportUnitComponent } from './export-unit.component';
import { environment } from '../../../../../environments/environment';
import { SelectUnitListComponent } from '../select-unit-list/select-unit-list.component';
import { ExportTestTakerConfigComponent } from '../export-test-taker-config/export-test-taker-config.component';
import { BookletConfigEditComponent } from '../booklet-config-edit/booklet-config-edit.component';
import { ExportUnitFileConfigComponent } from '../export-unit-file-config/export-unit-file-config.component';

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
  }

  @Component({ selector: 'studio-lite-export-test-taker-config', template: '', standalone: true })
  class MockTestConfigComponent {
    @Input() addTestTakersReview!: number;
    @Input() addTestTakersHot!: number;
    @Input() addTestTakersMonitor!: number;
    @Input() addPlayers!: boolean;
    @Input() passwordLess!: boolean;
  }

  @Component({ selector: 'studio-lite-booklet-config-edit', template: '', standalone: true })
  class MockBookletConfigComponent {
    @Input() disabled!: boolean;
    @Input() config!: BookletConfigDto | undefined;
  }

  @Component({ selector: 'studio-lite-export-unit-file-config', template: '', standalone: true })
  class MockExportUnitFileConfigComponent {
    @Input() addPlayers!: boolean;
    @Input() addComments!: boolean;
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

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
