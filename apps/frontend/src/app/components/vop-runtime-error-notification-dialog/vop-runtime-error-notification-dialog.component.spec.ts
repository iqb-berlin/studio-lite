import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  MAT_DIALOG_DATA, MatDialogModule, MatDialogRef
} from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import {
  VopRuntimeErrorNotificationDialogComponent
} from './vop-runtime-error-notification-dialog.component';
import * as de from '../../../assets/i18n/de.json';

// The tests translate without a loader, so the pipe only shows keys; this finds the German text behind one.
const germanText = (key: string): unknown => key.split('.')
  .reduce<unknown>((node, part) => (node as Record<string, unknown> | undefined)?.[part], de);

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
    const noCodeFixture = await createWithData({ message: 'Only message' });

    const codeEl = noCodeFixture.nativeElement.querySelector('code');
    expect(codeEl).toBeNull();
  });

  describe('explanation', () => {
    const explanationText = (f: ComponentFixture<VopRuntimeErrorNotificationDialogComponent>): string | undefined => (
      f.nativeElement.querySelector('[data-cy="runtime-error-dialog-explanation"]') as HTMLElement
    )?.textContent?.trim();

    const messageElement = (f: ComponentFixture<VopRuntimeErrorNotificationDialogComponent>): HTMLElement => (
      f.nativeElement.querySelector('[data-cy="runtime-error-dialog-message"]') as HTMLElement
    );

    it('should keep the generic text for an unknown code', () => {
      expect(component.isKnownCode).toBe(false);
      expect(component.explanationKey).toBe('runtime-error-dialog.message');
      expect(explanationText(fixture)).toBe('runtime-error-dialog.message');
    });

    it('should keep the generic text when no code is given', async () => {
      const noCodeFixture = await createWithData({ message: 'Only message' });

      expect(noCodeFixture.componentInstance.isKnownCode).toBe(false);
      expect(explanationText(noCodeFixture)).toBe('runtime-error-dialog.message');
    });

    it('should keep the message of an unknown code in bold', () => {
      expect(messageElement(fixture).querySelector('strong')?.textContent).toBe(mockDialogData.message);
      expect(messageElement(fixture).querySelector('small')).toBeNull();
    });

    it.each([
      ['geogebra-not-loading', 'runtime-error-dialog.codes.geogebra-not-loading'],
      ['geometry-timeout', 'runtime-error-dialog.codes.geometry-timeout'],
      ['image-not-loading', 'runtime-error-dialog.codes.image-not-loading'],
      ['media-timeout', 'runtime-error-dialog.codes.media-timeout'],
      ['media-duration-error', 'runtime-error-dialog.codes.media-duration-error']
    ])('should explain the known code %s', async (code, key) => {
      const knownFixture = await createWithData({ code, message: 'technical detail' });

      expect(knownFixture.componentInstance.isKnownCode).toBe(true);
      expect(explanationText(knownFixture)).toBe(key);
      expect(germanText(key)).toEqual(expect.any(String));
    });

    it('should give audio-timeout of older players the text of media-timeout', async () => {
      const audioFixture = await createWithData({ code: 'audio-timeout', message: 'technical detail' });

      expect(audioFixture.componentInstance.isKnownCode).toBe(true);
      expect(explanationText(audioFixture)).toBe('runtime-error-dialog.codes.media-timeout');
      expect(messageElement(audioFixture).querySelector('small')?.textContent).toBe('technical detail');
    });

    it('should fall back to a key that has a German text', () => {
      expect(germanText(component.explanationKey)).toEqual(expect.any(String));
    });

    it('should show the message of a known code as a small technical detail', async () => {
      const knownFixture = await createWithData({
        code: 'geogebra-not-loading',
        message: 'GeoGebra could not be loaded'
      });

      expect(messageElement(knownFixture).querySelector('small')?.textContent).toBe('GeoGebra could not be loaded');
      expect(messageElement(knownFixture).querySelector('strong')).toBeNull();
    });

    it('should still show the code of a known code', async () => {
      const knownFixture = await createWithData({ code: 'image-not-loading' });

      expect(knownFixture.nativeElement.querySelector('code')?.textContent?.trim()).toBe('image-not-loading');
    });
  });

  async function createWithData(
    data: { sessionId?: string, code?: string, message?: string }
  ): Promise<ComponentFixture<VopRuntimeErrorNotificationDialogComponent>> {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [MatDialogModule, TranslateModule.forRoot(), VopRuntimeErrorNotificationDialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: data }
      ]
    }).compileComponents();

    const dataFixture = TestBed.createComponent(VopRuntimeErrorNotificationDialogComponent);
    dataFixture.detectChanges();
    return dataFixture;
  }
});
