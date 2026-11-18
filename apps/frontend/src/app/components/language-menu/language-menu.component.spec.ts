import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { UiLanguage } from '@studio-lite/shared-code';
import { of } from 'rxjs';
import { LanguageMenuComponent } from './language-menu.component';
import { LanguageService } from '../../services/language.service';
import { UnitRoutingCanDeactivateGuard } from '../../modules/workspace/guards/unit-routing.guard';

describe('LanguageMenuComponent', () => {
  const de = { code: 'de', name: 'Deutsch' } as UiLanguage;
  const en = { code: 'en', name: 'English' } as UiLanguage;

  let fixture: ComponentFixture<LanguageMenuComponent>;
  let switchTo: jest.Mock;
  let canDeactivate: jest.Mock;

  const create = (languages: UiLanguage[], mayLeave = true): void => {
    switchTo = jest.fn();
    canDeactivate = jest.fn().mockReturnValue(of(mayLeave));
    TestBed.configureTestingModule({
      imports: [LanguageMenuComponent, TranslateModule.forRoot()],
      providers: [
        { provide: LanguageService, useValue: { languages, active: de, switchTo } },
        { provide: UnitRoutingCanDeactivateGuard, useValue: { canDeactivate } }
      ]
    });
    fixture = TestBed.createComponent(LanguageMenuComponent);
    fixture.detectChanges();
  };

  // A menu with one entry offers nothing (#2174).
  it('should not show while there is only one language', () => {
    create([de]);

    expect(fixture.nativeElement.querySelector('[data-cy="language-menu"]')).toBeNull();
  });

  it('should show once there is a second language', () => {
    create([de, en]);

    expect(fixture.nativeElement.querySelector('[data-cy="language-menu"]')).not.toBeNull();
  });

  // The switch reloads the page; unsaved changes to a unit get the question leaving the unit asks.
  it('should switch after the question about unsaved changes lets it', async () => {
    create([de, en]);

    await fixture.componentInstance.select('en');

    expect(canDeactivate).toHaveBeenCalled();
    expect(switchTo).toHaveBeenCalledWith('en');
  });

  it('should stay when the question about unsaved changes holds it back', async () => {
    create([de, en], false);

    await fixture.componentInstance.select('en');

    expect(switchTo).not.toHaveBeenCalled();
  });

  it('should neither ask nor switch for the language already active', async () => {
    create([de, en]);

    await fixture.componentInstance.select('de');

    expect(canDeactivate).not.toHaveBeenCalled();
    expect(switchTo).not.toHaveBeenCalled();
  });
});
