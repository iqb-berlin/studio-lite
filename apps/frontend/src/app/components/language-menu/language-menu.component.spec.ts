import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { UiLanguage } from '@studio-lite/shared-code';
import { LanguageMenuComponent } from './language-menu.component';
import { LanguageService } from '../../services/language.service';

describe('LanguageMenuComponent', () => {
  const de = { code: 'de', name: 'Deutsch' } as UiLanguage;
  const en = { code: 'en', name: 'English' } as UiLanguage;

  let fixture: ComponentFixture<LanguageMenuComponent>;
  let switchTo: jest.Mock;

  const create = (languages: UiLanguage[]): void => {
    switchTo = jest.fn();
    TestBed.configureTestingModule({
      imports: [LanguageMenuComponent, TranslateModule.forRoot()],
      providers: [{ provide: LanguageService, useValue: { languages, active: de, switchTo } }]
    });
    fixture = TestBed.createComponent(LanguageMenuComponent);
    fixture.detectChanges();
  };

  const trigger = (): HTMLButtonElement | null => fixture.nativeElement.querySelector('[data-cy="language-menu"]');

  // A menu with one entry offers nothing (#2174).
  it('should not show while there is only one language', () => {
    create([de]);

    expect(trigger()).toBeNull();
  });

  it('should list every language under its own name and switch to the one chosen', () => {
    create([de, en]);
    trigger()?.click();
    fixture.detectChanges();

    const english: HTMLButtonElement = document.querySelector('[data-cy="language-en"]') as HTMLButtonElement;
    expect(english.textContent).toContain('English');
    expect(english.getAttribute('lang')).toBe('en');
    english.click();

    expect(switchTo).toHaveBeenCalledWith('en');
  });
});
