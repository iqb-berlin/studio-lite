// eslint-disable-next-line max-classes-per-file
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { HttpClientModule } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { MatSelectModule } from '@angular/material/select';
import { Component, Input } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { PrintUnitsDialogComponent } from './print-units-dialog.component';

describe('PrintUnitsDialogComponent', () => {
  let component: PrintUnitsDialogComponent;
  let fixture: ComponentFixture<PrintUnitsDialogComponent>;

  @Component({ selector: 'studio-lite-select-unit-list', template: '' })
  class MockSelectUnitListComponent {
    @Input() disabled!: number[];
    @Input() filter!: number[];
    @Input() initialSelection!: number[];
    @Input() workspace!: unknown;
    @Input() showGroups!: boolean;
    @Input() selectionCount!: number;
    @Input() selectedUnitId!: number;
  }

  @Component({ selector: 'studio-lite-print-options', template: '' })
  class MockPrintOptionsComponent {
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        PrintUnitsDialogComponent,
        MockSelectUnitListComponent,
        MockPrintOptionsComponent
      ],
      imports: [
        MatDialogModule,
        HttpClientModule,
        MatSelectModule,
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

    fixture = TestBed.createComponent(PrintUnitsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
