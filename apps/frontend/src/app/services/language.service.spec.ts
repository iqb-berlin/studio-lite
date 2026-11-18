import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { UiLanguage } from '@studio-lite/shared-code';
import { LanguageService, OFFERED_UI_LANGUAGES } from './language.service';

describe('LanguageService', () => {
  const de = { code: 'de', name: 'Deutsch' } as UiLanguage;
  const en = { code: 'en', name: 'English' } as UiLanguage;

  let fakeWindow: {
    location: { hash: string; reload: jest.Mock };
    history: { replaceState: jest.Mock };
    addEventListener: jest.Mock;
    removeEventListener: jest.Mock;
  };

  const create = (hash: string): LanguageService => {
    fakeWindow = {
      location: { hash, reload: jest.fn() },
      history: { replaceState: jest.fn() },
      addEventListener: jest.fn(),
      removeEventListener: jest.fn()
    };
    TestBed.configureTestingModule({
      providers: [
        { provide: OFFERED_UI_LANGUAGES, useValue: [de, en] },
        { provide: DOCUMENT, useValue: { defaultView: fakeWindow } }
      ]
    });
    return TestBed.inject(LanguageService);
  };

  // What the browser sends when the address bar or back changes the address.
  const browserChangesHashTo = (hash: string, event: 'popstate' | 'hashchange'): void => {
    fakeWindow.location.hash = hash;
    const listener = fakeWindow.addEventListener.mock.calls.find(([name]) => name === event)?.[1];
    listener();
  };

  it('should run in the language the address names, and in German without one', () => {
    expect(create('#/en/a/5').active).toBe(en);
    TestBed.resetTestingModule();
    expect(create('#/a/5').active).toBe(de);
  });

  it('should write no prefix for German and its code for any other language', () => {
    expect(create('#/a/5').homeHref()).toBe('/#/home');
    TestBed.resetTestingModule();
    expect(create('#/en/a/5').homeHref()).toBe('/#/en/home');
  });

  it.each([
    ['German to English', '#/a/5/12/editor', 'en', '#/en/a/5/12/editor'],
    ['English to German', '#/en/a/5/12/editor', 'de', '#/a/5/12/editor'],
    ['the start page', '', 'en', '#/en/']
  ])('should reload the same page in the other language, from %s', (
    _: string, hash: string, code: string, reloadedAt: string
  ) => {
    const service = create(hash);

    service.switchTo(code);

    expect(fakeWindow.history.replaceState).toHaveBeenCalledWith(null, '', reloadedAt);
    expect(fakeWindow.location.reload).toHaveBeenCalled();
  });

  it.each([['the active language'], ['a language not offered']])('should not reload for %s', (which: string) => {
    const service = create('#/en/a/5');

    service.switchTo(which === 'the active language' ? 'en' : 'fr');

    expect(fakeWindow.location.reload).not.toHaveBeenCalled();
  });

  // Typed into the address bar or reached with back: the address decides the language (#2174).
  it.each([['popstate' as const], ['hashchange' as const]])(
    'should reload when the browser brings an address in another language (%s)',
    (event: 'popstate' | 'hashchange') => {
      create('#/a/5');

      browserChangesHashTo('#/en/a/5', event);

      expect(fakeWindow.location.reload).toHaveBeenCalled();
    }
  );

  it('should not reload when the browser brings an address in the same language', () => {
    create('#/en/a/5');

    browserChangesHashTo('#/en/a/6', 'popstate');

    expect(fakeWindow.location.reload).not.toHaveBeenCalled();
  });
});
