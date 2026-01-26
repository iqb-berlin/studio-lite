import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { InputTextComponent, InputTextData } from './input-text.component';

describe('InputTextComponent', () => {
  let component: InputTextComponent;
  let fixture: ComponentFixture<InputTextComponent>;
  let mockDialogRef: Partial<MatDialogRef<InputTextComponent>>;

  const mockDialogData: InputTextData = {
    title: 'Test Title',
    prompt: 'Test Prompt',
    default: 'Default Value',
    okButtonLabel: 'OK',
    isBackUpWorkspaceGroup: false,
    maxWorkspaceCount: 10,
    workspacesCount: 5
  };

  beforeEach(async () => {
    mockDialogRef = {
      close: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule,
        MatDialogModule,
        TranslateModule.forRoot(),
        InputTextComponent
      ],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: mockDialogData },
        { provide: MatDialogRef, useValue: mockDialogRef }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(InputTextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form with the default value', () => {
    expect(component.textInputForm.get('text')?.value).toBe(mockDialogData.default);
  });

  it('should be invalid if the text field is empty', () => {
    component.textInputForm.get('text')?.setValue('');
    expect(component.textInputForm.invalid).toBeTruthy();
  });

  it('should render the correct title and prompt', () => {
    const title = fixture.debugElement.query(By.css('h1[mat-dialog-title]')).nativeElement;
    const input = fixture.debugElement.query(By.css('input')).nativeElement;

    expect(title.textContent).toContain(mockDialogData.title);
    expect(input.placeholder).toBe(mockDialogData.prompt);
  });

  it('should show the warning when isBackUpWorkspaceGroup is true and workspacesCount > maxWorkspaceCount', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule,
        MatDialogModule,
        TranslateModule.forRoot(),
        InputTextComponent
      ],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: { ...mockDialogData, isBackUpWorkspaceGroup: true, workspacesCount: 15 }
        },
        { provide: MatDialogRef, useValue: mockDialogRef }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(InputTextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const warning = fixture.debugElement.query(By.css('.warning'));
    expect(warning).toBeTruthy();
  });

  it('should NOT show the warning when isBackUpWorkspaceGroup is true but workspacesCount <= maxWorkspaceCount', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule,
        MatDialogModule,
        TranslateModule.forRoot(),
        InputTextComponent
      ],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: { ...mockDialogData, isBackUpWorkspaceGroup: true, workspacesCount: 5 }
        },
        { provide: MatDialogRef, useValue: mockDialogRef }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(InputTextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const warning = fixture.debugElement.query(By.css('.warning'));
    expect(warning).toBeFalsy();
  });

  it('should disable the OK button when the form is invalid', () => {
    component.textInputForm.get('text')?.setValue('');
    fixture.detectChanges();
    const okButton = fixture.debugElement.query(By.css('button[type="submit"]')).nativeElement;
    expect(okButton.disabled).toBeTruthy();
  });

  it('should close the dialog with the form value when OK button is clicked', () => {
    component.textInputForm.get('text')?.setValue('New Value');
    fixture.detectChanges();
    const okButton = fixture.debugElement.query(By.css('button[type="submit"]')).nativeElement;
    okButton.click();
    expect(mockDialogRef.close).toHaveBeenCalledWith('New Value');
  });

  it('should close the dialog with false when Cancel button is clicked', () => {
    const buttons = fixture.debugElement.queryAll(By.css('button'));
    const cancelButton = buttons.find(btn => {
      const text = btn.nativeElement.textContent.trim();
      const close = btn.nativeElement.getAttribute('mat-dialog-close');
      return text === 'cancel' || close === 'false';
    });
    expect(cancelButton).toBeDefined();
    cancelButton!.nativeElement.click();
    expect(mockDialogRef.close).toHaveBeenCalledWith(false);
  });
});
