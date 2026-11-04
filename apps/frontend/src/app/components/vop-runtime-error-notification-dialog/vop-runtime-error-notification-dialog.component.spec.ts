import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  MAT_DIALOG_DATA, MatDialogModule, MatDialogRef
} from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import {
  RuntimeError,
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

  it('should initialize sessionId and the first runtime error from dialog data', () => {
    expect(component.sessionId).toBe(mockDialogData.sessionId);
    expect(component.groups()).toEqual([{
      explanationKey: 'runtime-error-dialog.message',
      isKnownCode: false,
      runtimeErrors: [mockDialogData]
    }]);
  });

  it('should render code in the template when provided', () => {
    const codeEl = fixture.nativeElement.querySelector('code') as HTMLElement;
    expect(codeEl?.textContent?.trim()).toBe(mockDialogData.code);
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
      expect(component.groups()[0].isKnownCode).toBe(false);
      expect(component.groups()[0].explanationKey).toBe('runtime-error-dialog.message');
      expect(explanationText(fixture)).toBe('runtime-error-dialog.message');
    });

    it('should keep the generic text when no code is given', async () => {
      const noCodeFixture = await createWithData({ message: 'Only message' });

      expect(noCodeFixture.componentInstance.groups()[0].isKnownCode).toBe(false);
      expect(explanationText(noCodeFixture)).toBe('runtime-error-dialog.message');
    });

    it('should keep the message of an unknown code in bold', () => {
      expect(messageElement(fixture).querySelector('strong')?.textContent).toBe(mockDialogData.message);
      expect(messageElement(fixture).querySelector('small')).toBeNull();
    });

    it.each([
      ['GEOGEBRA_NOT_LOADING', 'GEOGEBRA_NOT_LOADING'],
      ['geogebra-not-loading', 'GEOGEBRA_NOT_LOADING'],
      ['GEOGEBRA_TIMEOUT', 'GEOGEBRA_TIMEOUT'],
      ['geometry-timeout', 'GEOGEBRA_TIMEOUT'],
      ['IMAGE_NOT_LOADING', 'IMAGE_NOT_LOADING'],
      ['image-not-loading', 'IMAGE_NOT_LOADING'],
      ['MEDIA_TIMEOUT', 'MEDIA_TIMEOUT'],
      ['media-timeout', 'MEDIA_TIMEOUT'],
      ['audio-timeout', 'MEDIA_TIMEOUT'],
      ['MEDIA_DURATION_ERROR', 'MEDIA_DURATION_ERROR'],
      ['media-duration-error', 'MEDIA_DURATION_ERROR']
    ])('should explain the code %s with the text of %s', async (code, specCode) => {
      const key = `runtime-error-dialog.codes.${specCode}`;
      const knownFixture = await createWithData({ code, message: 'technical detail' });

      expect(knownFixture.componentInstance.groups()[0].isKnownCode).toBe(true);
      expect(explanationText(knownFixture)).toBe(key);
      expect(germanText(key)).toEqual(expect.stringMatching(/\S/));
    });

    it('should fall back to a key that has a German text', () => {
      expect(germanText(component.groups()[0].explanationKey)).toEqual(expect.stringMatching(/\S/));
    });

    it('should show the message of a known code as a small technical detail', async () => {
      const knownFixture = await createWithData({
        code: 'GEOGEBRA_NOT_LOADING',
        message: 'GeoGebra could not be loaded'
      });

      expect(messageElement(knownFixture).querySelector('small')?.textContent).toBe('GeoGebra could not be loaded');
      expect(messageElement(knownFixture).querySelector('strong')).toBeNull();
    });

    it('should still show the code of a known code', async () => {
      const knownFixture = await createWithData({ code: 'IMAGE_NOT_LOADING' });

      expect(knownFixture.nativeElement.querySelector('code')?.textContent?.trim()).toBe('IMAGE_NOT_LOADING');
    });
  });

  describe('runtime errors that arrive while the dialog is open', () => {
    const allTexts = (
      f: ComponentFixture<VopRuntimeErrorNotificationDialogComponent>,
      dataCy: string
    ): (string | undefined)[] => Array.from(
      f.nativeElement.querySelectorAll(`[data-cy="${dataCy}"]`) as NodeListOf<HTMLElement>
    ).map(element => element.textContent?.trim());

    const groupSummary = (
      dialog: VopRuntimeErrorNotificationDialogComponent
    ): [string, (string | undefined)[]][] => dialog.groups()
      .map(group => [group.explanationKey, group.runtimeErrors.map(runtimeError => runtimeError.message)]);

    it('should list another message of the same code below the one explanation', async () => {
      const imageFixture = await createWithData({ code: 'IMAGE_NOT_LOADING', message: 'image a' });

      imageFixture.componentInstance.add({ code: 'IMAGE_NOT_LOADING', message: 'image b' });
      imageFixture.detectChanges();

      expect(groupSummary(imageFixture.componentInstance)).toEqual([
        ['runtime-error-dialog.codes.IMAGE_NOT_LOADING', ['image a', 'image b']]
      ]);
      expect(allTexts(imageFixture, 'runtime-error-dialog-explanation'))
        .toEqual(['runtime-error-dialog.codes.IMAGE_NOT_LOADING']);
      expect(allTexts(imageFixture, 'runtime-error-dialog-message')).toEqual(['image a', 'image b']);
    });

    it('should not add a runtime error that is already shown', async () => {
      const imageFixture = await createWithData({ code: 'IMAGE_NOT_LOADING', message: 'image a' });

      imageFixture.componentInstance.add({ code: 'IMAGE_NOT_LOADING', message: 'image a' });
      imageFixture.detectChanges();

      expect(allTexts(imageFixture, 'runtime-error-dialog-message')).toEqual(['image a']);
    });

    it('should add the same message under another code', async () => {
      const mediaFixture = await createWithData({ code: 'MEDIA_TIMEOUT', message: 'video a' });

      mediaFixture.componentInstance.add({ code: 'MEDIA_DURATION_ERROR', message: 'video a' });

      expect(groupSummary(mediaFixture.componentInstance)).toEqual([
        ['runtime-error-dialog.codes.MEDIA_TIMEOUT', ['video a']],
        ['runtime-error-dialog.codes.MEDIA_DURATION_ERROR', ['video a']]
      ]);
    });

    it('should put the old and the new spelling of a code under one explanation', async () => {
      const mediaFixture = await createWithData({ code: 'media-timeout', message: 'audio a' });

      mediaFixture.componentInstance.add({ code: 'MEDIA_TIMEOUT', message: 'video b' });

      expect(groupSummary(mediaFixture.componentInstance)).toEqual([
        ['runtime-error-dialog.codes.MEDIA_TIMEOUT', ['audio a', 'video b']]
      ]);
    });

    it('should put all unknown codes under the one generic sentence', () => {
      component.add({ code: 'ANOTHER_UNKNOWN', message: 'another' });
      component.add({ message: 'without code' });
      fixture.detectChanges();

      expect(groupSummary(component)).toEqual([
        ['runtime-error-dialog.message', [mockDialogData.message, 'another', 'without code']]
      ]);
      expect(allTexts(fixture, 'runtime-error-dialog-explanation')).toEqual(['runtime-error-dialog.message']);
    });

    it('should show the explanations in the order their first error arrived', async () => {
      const mixedFixture = await createWithData({ code: 'MEDIA_TIMEOUT', message: 'video a' });

      mixedFixture.componentInstance.add({ code: 'IMAGE_NOT_LOADING', message: 'image a' });
      mixedFixture.componentInstance.add({ code: 'MEDIA_TIMEOUT', message: 'video b' });
      mixedFixture.detectChanges();

      expect(allTexts(mixedFixture, 'runtime-error-dialog-explanation')).toEqual([
        'runtime-error-dialog.codes.MEDIA_TIMEOUT',
        'runtime-error-dialog.codes.IMAGE_NOT_LOADING'
      ]);
      expect(allTexts(mixedFixture, 'runtime-error-dialog-message')).toEqual(['video a', 'video b', 'image a']);
    });

    it('should show the session ID once', () => {
      component.add({ sessionId: mockDialogData.sessionId, code: 'IMAGE_NOT_LOADING', message: 'image a' });
      fixture.detectChanges();

      const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
      expect(text.split(mockDialogData.sessionId).length - 1).toBe(1);
    });
  });

  async function createWithData(
    data: RuntimeError
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
