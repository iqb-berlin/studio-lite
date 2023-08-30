import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { Component, Input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { AppService } from '../../../../services/app.service';
import { BackendService } from '../../services/backend.service';
import { WorkspaceService } from '../../services/workspace.service';
import { SelectUnitComponent } from './select-unit.component';

describe('SelectUnitComponent', () => {
  let component: SelectUnitComponent;
  let fixture: ComponentFixture<SelectUnitComponent>;

  @Component({ selector: 'studio-lite-select-unit-list', template: '' })
  class MockSelectUnitListComponent {
    @Input() filter!: number[];
    @Input() initialSelection!: number[];
    @Input() selectedUnitIds!: number[];
    @Input() workspace!: number;
    @Input() disabled!: number[];
    @Input() selectionCount!: number;
    @Input() multiple!: boolean;
    @Input() selectedUnitId!: number;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        SelectUnitComponent,
        MockSelectUnitListComponent
      ],
      imports: [
        ReactiveFormsModule,
        MatDialogModule,
        TranslateModule.forRoot()
      ],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            title: 'test',
            buttonLabel: 'test',
            fromOtherWorkspacesToo: false,
            multiple: false
          }
        },
        {
          provide: BackendService,
          useValue: {}
        },
        {
          provide: AppService,
          useValue: {}
        },
        {
          provide: WorkspaceService,
          useValue: {}
        }
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectUnitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component)
      .toBeTruthy();
  });
});
