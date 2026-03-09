import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  MAT_DIALOG_DATA, MatDialogModule, MatDialogRef
} from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import {
  VopRuntimeErrorNotificationDialogComponent
} from './vop-runtime-error-notification-dialog.component';

describe('VopRuntimeErrorNotificationDialogComponent', () => {
  let component: VopRuntimeErrorNotificationDialogComponent;
  let fixture: ComponentFixture<VopRuntimeErrorNotificationDialogComponent>;
  let mockDialogRef: Partial<MatDialogRef<VopRuntimeErrorNotificationDialogComponent>>;

  const mockDialogData = {
    sessionId: 'session-42',
    code: 'ERR_UNKNOWN',
    message: 'Something went wrong in the player'
  };

  beforeEach(async () => {
    mockDialogRef = { close: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [
        MatDialogModule,
        TranslateModule.forRoot(),
        VopRuntimeErrorNotificationDialogComponent
      ],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: mockDialogData }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(VopRuntimeErrorNotificationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize sessionId, code and message from dialog data', () => {
    expect(component.sessionId).toBe(mockDialogData.sessionId);
    expect(component.code).toBe(mockDialogData.code);
    expect(component.message).toBe(mockDialogData.message);
  });

  it('should close the dialog when close button is clicked', () => {
    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    button.click();
    expect(mockDialogRef.close).toHaveBeenCalled();
  });

  it('should render code in the template when provided', () => {
    const codeEl = fixture.nativeElement.querySelector('code') as HTMLElement;
    expect(codeEl?.textContent?.trim()).toBe(mockDialogData.code);
  });

  it('should render message in the template when provided', () => {
    const paragraphs = fixture.nativeElement.querySelectorAll('p strong') as NodeListOf<HTMLElement>;
    const messageEl = Array.from(paragraphs).find(el => el.textContent?.includes(mockDialogData.message));
    expect(messageEl).toBeTruthy();
  });

  it('should render sessionId in the template when provided', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain(mockDialogData.sessionId);
  });

  it('should not render code block when code is undefined', async () => {
    await TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [MatDialogModule, TranslateModule.forRoot(), VopRuntimeErrorNotificationDialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: { message: 'Only message' } }
      ]
    }).compileComponents();

    const noCodeFixture = TestBed.createComponent(VopRuntimeErrorNotificationDialogComponent);
    noCodeFixture.detectChanges();

    const codeEl = noCodeFixture.nativeElement.querySelector('code');
    expect(codeEl).toBeNull();
  });
});
