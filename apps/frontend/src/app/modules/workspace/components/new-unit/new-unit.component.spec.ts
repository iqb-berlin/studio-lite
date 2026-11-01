import {
  ComponentFixture, TestBed, fakeAsync, tick
} from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { UntypedFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ElementRef } from '@angular/core';
import { NewUnitComponent } from './new-unit.component';
import { AppService } from '../../../../services/app.service';
import { WorkspaceBackendService } from '../../services/workspace-backend.service';
import { WorkspaceService } from '../../services/workspace.service';

jest.mock('../../services/workspace.service');

describe('NewUnitComponent', () => {
  let component: NewUnitComponent;
  let fixture: ComponentFixture<NewUnitComponent>;
  const MockSimpleClass = WorkspaceService as jest.Mocked<typeof WorkspaceService>;
  MockSimpleClass.unitKeyUniquenessValidator
    .mockImplementation(() => () => null);

  const mockWorkspaceServiceInstance = {
    unitList: []
  };

  const mockData = {
    key: 'test',
    label: 'Test Label',
    groups: ['Group1']
  };

  beforeEach(async () => {
    // Spy on static methods of WorkspaceService
    jest.spyOn(WorkspaceService, 'unitKeyPatternString').mockReturnValue('^.*$');
    jest.spyOn(WorkspaceService, 'unitKeyUniquenessValidator').mockReturnValue(() => null);

    await TestBed.configureTestingModule({
      imports: [
        MatDialogModule,
        ReactiveFormsModule,
        TranslateModule.forRoot(),
        NewUnitComponent
      ],
      providers: [
        UntypedFormBuilder,
        {
          provide: MAT_DIALOG_DATA,
          useValue: mockData
        },
        {
          provide: WorkspaceBackendService,
          useValue: {}
        },
        {
          provide: AppService,
          useValue: {}
        },
        {
          provide: WorkspaceService,
          useValue: mockWorkspaceServiceInstance
        }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(NewUnitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should set group direct mode to true if no groups provided', () => {
    // Re-create component with empty groups
    TestBed.resetTestingModule();

    // We need to setup again because reset clears it
    jest.spyOn(WorkspaceService, 'unitKeyPatternString').mockReturnValue('^.*$');
    jest.spyOn(WorkspaceService, 'unitKeyUniquenessValidator').mockReturnValue(() => null);

    TestBed.configureTestingModule({
      imports: [
        MatDialogModule,
        ReactiveFormsModule,
        TranslateModule.forRoot(),
        NewUnitComponent
      ],
      providers: [
        UntypedFormBuilder,
        {
          provide: MAT_DIALOG_DATA,
          useValue: { ...mockData, groups: [] }
        },
        {
          provide: WorkspaceBackendService,
          useValue: {}
        },
        {
          provide: AppService,
          useValue: {}
        },
        {
          provide: WorkspaceService,
          useValue: mockWorkspaceServiceInstance
        }
      ]
    });

    const f = TestBed.createComponent(NewUnitComponent);
    const c = f.componentInstance;
    f.detectChanges();

    expect(c.groupDirectMode).toBe(true);
  });

  it('should switch to direct group mode and focus input', fakeAsync(() => {
    const inputElement = document.createElement('input');
    const focusSpy = jest.spyOn(inputElement, 'focus');

    // Assign mock ElementRef
    component.newGroupInput = new ElementRef(inputElement);

    component.setGroupDirectMode(true);

    expect(component.groupDirectMode).toBe(true);
    tick(100);
    expect(focusSpy).toHaveBeenCalled();
  }));

  // Only the group of the view open on saving counts; a typed one won over a selected one (#2015).
  describe('switching between the selection and a new group', () => {
    const groupFields = () => ({
      groupSelect: component.newUnitForm.get('groupSelect')?.value,
      groupDirect: component.newUnitForm.get('groupDirect')?.value
    });

    it('should drop the typed group when going back to the selection', fakeAsync(() => {
      component.setGroupDirectMode(true);
      component.newUnitForm.get('groupDirect')?.setValue('New');
      component.setGroupDirectMode(false);
      component.newUnitForm.get('groupSelect')?.setValue('Group1');
      tick(100);

      expect(groupFields()).toEqual({ groupSelect: 'Group1', groupDirect: '' });
    }));

    it('should drop the selected group when typing a new one', fakeAsync(() => {
      component.newUnitForm.get('groupSelect')?.setValue('Group1');
      component.setGroupDirectMode(true);
      tick(100);

      expect(groupFields()).toEqual({ groupSelect: '', groupDirect: '' });
    }));
  });
});
