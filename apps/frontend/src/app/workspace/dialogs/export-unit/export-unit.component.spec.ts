// eslint-disable-next-line max-classes-per-file
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClientModule } from '@angular/common/http';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { Component, Input } from '@angular/core';
import { BookletConfigDto } from '@studio-lite-lib/api-dto';
import { MatExpansionModule } from '@angular/material/expansion';
import { ExportUnitComponent } from './export-unit.component';
import { environment } from '../../../../environments/environment';

describe('ExportUnitComponent', () => {
  let component: ExportUnitComponent;
  let fixture: ComponentFixture<ExportUnitComponent>;

  @Component({ selector: 'select-unit-list', template: '' })
  class MockSelectUnitListComponent {
    @Input() filter!: number[];
    @Input() initialSelection!: number[];
    @Input() workspace!: unknown;
    @Input() showGroups!: boolean;
    disabled!: number[];
    selectionCount!: number;
  }

  @Component({ selector: 'studio-lite-testcenter-data', template: '' })
  class MockTestcenterDataComponent {
    @Input() addTestTakersReview!: number;
    @Input() addTestTakersHot!: number;
    @Input() addTestTakersMonitor!: number;
    @Input() addPlayers!: boolean;
    @Input() passwordLess!: boolean;
  }

  @Component({ selector: 'studio-lite-booklet-config-edit', template: '' })
  class MockBookletConfigComponent {
    @Input() disabled!: boolean;
    @Input() config!: BookletConfigDto | undefined;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        ExportUnitComponent,
        MockSelectUnitListComponent,
        MockTestcenterDataComponent,
        MockBookletConfigComponent
      ],
      imports: [
        MatDialogModule,
        HttpClientModule,
        MatExpansionModule,
        TranslateModule.forRoot()
      ],
      providers: [
        {
          provide: 'SERVER_URL',
          useValue: environment.backendUrl
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {}
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ExportUnitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
