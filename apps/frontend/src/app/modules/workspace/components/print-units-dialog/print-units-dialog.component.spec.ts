// eslint-disable-next-line max-classes-per-file
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { MatSelectModule } from '@angular/material/select';
import { Component, Input } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { PrintUnitsDialogComponent } from './print-units-dialog.component';

describe('PrintUnitsDialogComponent', () => {
  let component: PrintUnitsDialogComponent;
  let fixture: ComponentFixture<PrintUnitsDialogComponent>;

  @Component({ selector: 'studio-lite-select-unit-list', template: '', standalone: false })
  class MockSelectUnitListComponent {
    @Input() disabled!: number[];
    @Input() filter!: number[];
    @Input() initialSelection!: number[];
    @Input() workspace!: unknown;
    @Input() showGroups!: boolean;
    @Input() selectionCount!: number;
    @Input() selectedUnitId!: number;
  }

  @Component({ selector: 'studio-lite-print-options', template: '', standalone: false })
  class MockPrintOptionsComponent {
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        MockSelectUnitListComponent,
        MockPrintOptionsComponent
      ],
      imports: [
        MatDialogModule,
        NoopAnimationsModule,
        MatSelectModule,
        TranslateModule.forRoot()
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
    }).compileComponents();

    fixture = TestBed.createComponent(PrintUnitsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
