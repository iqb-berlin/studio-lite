// eslint-disable-next-line max-classes-per-file
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { UntypedFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { TranslateModule } from '@ngx-translate/core';
import { Component, Input } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { provideHttpClient } from '@angular/common/http';
import { MoveUnitComponent } from './move-unit.component';
import { environment } from '../../../../../environments/environment';
import { AppService } from '../../../../services/app.service';
import { WorkspaceService } from '../../services/workspace.service';
import { SelectUnitListComponent } from '../select-unit-list/select-unit-list.component';

describe('MoveUnitComponent', () => {
  let component: MoveUnitComponent;
  let fixture: ComponentFixture<MoveUnitComponent>;

  @Component({ selector: 'studio-lite-select-unit-list', template: '', standalone: true })
  class MockSelectUnitListComponent {
    @Input() disabled!: number[];
    @Input() filter!: number[];
    @Input() initialSelection!: number[];
    @Input() workspace!: unknown;
    @Input() showGroups!: boolean;
    @Input() selectionCount!: number;
    @Input() selectedUnitId!: number;

    selectedUnitIds: number[] = [100, 200];
  }

  const mockAppService = {
    authData: {
      userId: 1,
      workspaces: [
        {
          id: 10,
          name: 'Group 1',
          workspaces: [
            { id: 1, name: 'Workspace 1', userAccessLevel: 3 },
            { id: 2, name: 'Workspace 2', userAccessLevel: 3 }, // valid target
            { id: 3, name: 'Workspace 3', userAccessLevel: 2 } // insufficient access
          ]
        }
      ]
    }
  };

  const mockWorkspaceService = {
    selectedUnit$: { value: 0 }
  };

  const mockData = {
    currentWorkspaceId: 1
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MatSelectModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatTableModule,
        MatCheckboxModule,
        TranslateModule.forRoot(),
        MoveUnitComponent
      ],
      providers: [
        provideHttpClient(),
        {
          provide: MAT_DIALOG_DATA,
          useValue: mockData
        },
        UntypedFormBuilder,
        {
          provide: AppService,
          useValue: mockAppService
        },
        {
          provide: WorkspaceService,
          useValue: mockWorkspaceService
        },
        {
          provide: 'SERVER_URL',
          useValue: environment.backendUrl
        }
      ]
    })
      .overrideComponent(MoveUnitComponent, {
        remove: { imports: [SelectUnitListComponent] },
        add: { imports: [MockSelectUnitListComponent] }
      })
      .compileComponents();

    fixture = TestBed.createComponent(MoveUnitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component)
      .toBeTruthy();
  });

  it('should initialize workspaceList correctly excluding current workspace and low access level', () => {
    // Total workspaces in mock: 3
    // WS #1: excluded (current)
    // WS #2: included (access level 3)
    // WS #3: excluded (access level 2 <= 2)
    expect(component.workspaceList.length).toBe(1);
    expect(component.workspaceList[0].id).toBe(2);
  });

  it('should get targetWorkspace value from form', () => {
    component.selectForm.enable();
    // eslint-disable-next-line @typescript-eslint/dot-notation
    component.selectForm.controls['wsSelector'].setValue(123);
    expect(component.targetWorkspace).toBe(123);
  });

  it('should get selectedUnits from child component', () => {
    // Start with undefined child to check robustness
    Object.defineProperty(component, 'unitSelectionTable', { value: undefined });
    expect(component.selectedUnits).toEqual([]);

    // Inject mock child
    const mockChild = new MockSelectUnitListComponent();
    Object.defineProperty(component, 'unitSelectionTable', { value: mockChild });
    expect(component.selectedUnits).toEqual([100, 200]);
  });
});
