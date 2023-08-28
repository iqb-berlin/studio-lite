// eslint-disable-next-line max-classes-per-file
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { MatSelectModule } from '@angular/material/select';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { Component, Input } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MoveUnitComponent } from './move-unit.component';
import { environment } from '../../../../../environments/environment';

describe('MoveUnitComponent', () => {
  let component: MoveUnitComponent;
  let fixture: ComponentFixture<MoveUnitComponent>;

  @Component({ selector: 'studio-lite-search-filter', template: '' })
  class MockSearchFilterComponent {
    value: string = '';
  }

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

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        MoveUnitComponent,
        MockSelectUnitListComponent,
        MockSearchFilterComponent
      ],
      imports: [
        MatSelectModule,
        HttpClientModule,
        ReactiveFormsModule,
        NoopAnimationsModule,
        MatDialogModule,
        MatTableModule,
        MatCheckboxModule,
        TranslateModule.forRoot()
      ],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: {}
        },
        {
          provide: FormBuilder,
          useValue: {}
        },
        {
          provide: 'SERVER_URL',
          useValue: environment.backendUrl
        }
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MoveUnitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component)
      .toBeTruthy();
  });
});
