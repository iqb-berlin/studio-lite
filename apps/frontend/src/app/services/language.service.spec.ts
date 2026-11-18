import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { UiLanguage } from '@studio-lite/shared-code';
import { of } from 'rxjs';
import { LanguageService, OFFERED_UI_LANGUAGES } from './language.service';
import { UnitRoutingCanDeactivateGuard } from '../modules/workspace/guards/unit-routing.guard';

describe('LanguageService', () => {
  const de = { code: 'de', name: 'Deutsch' } as UiLanguage;
  const en = { code: 'en', name: 'English' } as UiLanguage;

  let fakeWindow: { location: { hash: string; reload: jest.Mock }; history: { replaceState: jest.Mock } };
  let canDeactivate: jest.Mock;

  const create = (hash: string, mayLeave: () => unknown = () => of(true)): LanguageService => {
    fakeWindow = { location: { hash, reload: jest.fn() }, history: { replaceState: jest.fn() } };
    canDeactivate = jest.fn(mayLeave);
    TestBed.configureTestingModule({
      providers: [
        { provide: OFFERED_UI_LANGUAGES, useValue: [de, en] },
        { provide: DOCUMENT, useValue: { defaultView: fakeWindow } },
        { provide: UnitRoutingCanDeactivateGuard, useValue: { canDeactivate } }
      ]
    });
    return TestBed.inject(LanguageService);
  };

  it.each([
    ['#/en/a/5', en, '/#/en/home'],
    ['#/a/5', de, '/#/home'],
    ['', de, '/#/home']
  ])('should run %s in the language the address names, with its start page', (
    hash: string, active: UiLanguage, home: string
  ) => {
    const service = create(hash);

    expect(service.active).toBe(active);
    expect(service.homeHref()).toBe(home);
  });

  it.each([
    ['#/a/5/12/editor', 'en', '#/en/a/5/12/editor'],
    ['#/en/a/5/12/editor', 'de', '#/a/5/12/editor'],
    ['', 'en', '#/en/']
  ])('should reload %s in the language %s once leaving the unit is allowed', async (
    hash: string, code: string, reloadedAt: string
  ) => {
    const service = create(hash);

    await service.switchTo(code);

    expect(canDeactivate).toHaveBeenCalled();
    expect(fakeWindow.history.replaceState).toHaveBeenCalledWith(null, '', reloadedAt);
    expect(fakeWindow.location.reload).toHaveBeenCalled();
  });

  // A reload drops unsaved changes to a unit; they get the question leaving the unit asks (#2175).
  it.each([
    ['the question keeps the user on the unit', () => of(false)],
    ['the question is answered by a promise', () => Promise.resolve(false)]
  ])('should stay in the language when %s', async (_: string, mayLeave: () => unknown) => {
    const service = create('#/a/5', mayLeave);

    await service.switchTo('en');

    expect(fakeWindow.location.reload).not.toHaveBeenCalled();
  });

  it.each([['de'], ['fr']])('should neither ask nor reload for %s from German', async (code: string) => {
    const service = create('#/a/5');

    await service.switchTo(code);

    expect(canDeactivate).not.toHaveBeenCalled();
    expect(fakeWindow.location.reload).not.toHaveBeenCalled();
  });
});
