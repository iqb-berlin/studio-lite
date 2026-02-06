import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { MatInputModule } from '@angular/material/input';
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
        NoopAnimationsModule,
        MatDialogModule,
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

  it('should create', () => {
    expect(component).toBeTruthy();
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

  it('should have data property with wsg information', () => {
    expect(component.data).toBeDefined();
    expect(component.data.wsg?.id).toBe(1);
    expect(component.data.wsg?.name).toBe('Test Group');
    expect(component.data.title).toBe('Edit Workspace Group');
    expect(component.data.saveButtonLabel).toBe('Save');
  });

  it('should have editWorkspaceGroupForm defined', () => {
    expect(component.editWorkspaceGroupForm).toBeDefined();
    expect(component.editWorkspaceGroupForm.get('name')).toBeDefined();
  });

  it('should mark form as invalid when name is too short', () => {
    component.editWorkspaceGroupForm.patchValue({ name: 'ab' });
    expect(component.editWorkspaceGroupForm.valid).toBe(false);
  });

  it('should mark form as valid when name meets requirements', () => {
    component.editWorkspaceGroupForm.patchValue({ name: 'Valid Group Name' });
    expect(component.editWorkspaceGroupForm.valid).toBe(true);
  });
});
