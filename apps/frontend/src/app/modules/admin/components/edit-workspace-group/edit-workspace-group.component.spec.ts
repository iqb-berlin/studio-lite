import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { EditWorkspaceGroupComponent } from './edit-workspace-group.component';
import { EditWorkspaceGroupComponentData } from '../../models/edit-workspace-group-component-data.type';

describe('EditWorkspaceGroupComponent', () => {
  let component: EditWorkspaceGroupComponent;
  let fixture: ComponentFixture<EditWorkspaceGroupComponent>;

  const mockDialogData: EditWorkspaceGroupComponentData = {
    wsg: {
      id: 1,
      name: 'Test Group'
    },
    title: 'Edit Workspace Group',
    saveButtonLabel: 'Save'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        EditWorkspaceGroupComponent,
        MatInputModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatSelectModule,
        TranslateModule.forRoot()
      ],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: mockDialogData
        }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(EditWorkspaceGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should initialize form with dialog data', () => {
    expect(component.editWorkspaceGroupForm.get('name')?.value).toBe('Test Group');
    expect(component.name).toBe('Test Group');
  });

  it('should validate name field as required', () => {
    const nameControl = component.editWorkspaceGroupForm.get('name');

    nameControl?.setValue('');
    expect(nameControl?.hasError('required')).toBe(true);
    expect(nameControl?.valid).toBe(false);

    nameControl?.setValue('Valid Name');
    expect(nameControl?.hasError('required')).toBe(false);
  });

  it('should validate name field minimum length', () => {
    const nameControl = component.editWorkspaceGroupForm.get('name');

    nameControl?.setValue('ab');
    expect(nameControl?.hasError('minlength')).toBe(true);
    expect(nameControl?.valid).toBe(false);

    nameControl?.setValue('abc');
    expect(nameControl?.hasError('minlength')).toBe(false);
    expect(nameControl?.valid).toBe(true);
  });
});
