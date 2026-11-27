import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageCodedText as TextWithLanguage } from '@iqbspecs/metadata-profile';
import { MetadataProfilesComponent } from './metadata-profiles.component';
import { ProfileNamesService } from '../../services/profile-names.service';
import { LanguageService } from '../../../../services/language.service';
import { MetadataProfileUse } from '../../utils/metadata-profiles.utils';

const MATH_ITEM = 'https://w3id.org/iqb/p11/item/';
const GERMAN_UNIT = 'https://w3id.org/iqb/p12/unit/';
const MATH_UNIT = 'https://w3id.org/iqb/p11/unit/';

describe('MetadataProfilesComponent', () => {
  let fixture: ComponentFixture<MetadataProfilesComponent>;
  let request: jest.Mock;
  const labels = signal<Record<string, TextWithLanguage[]>>({});

  const create = (inputs: {
    unit?: MetadataProfileUse; items?: MetadataProfileUse; withTarget?: boolean; collapsible?: boolean
  }) => {
    request = jest.fn();
    TestBed.configureTestingModule({
      imports: [MetadataProfilesComponent, TranslateModule.forRoot()],
      providers: [
        { provide: ProfileNamesService, useValue: { labels: labels.asReadonly(), request } },
        { provide: LanguageService, useValue: { active: { code: 'en' } } }
      ]
    });
    fixture = TestBed.createComponent(MetadataProfilesComponent);
    Object.entries(inputs).forEach(([name, value]) => fixture.componentRef.setInput(name, value));
    fixture.detectChanges();
  };

  beforeEach(() => {
    labels.set({
      [GERMAN_UNIT]: [{ lang: 'de', value: 'IQB Deutsch Primar - Aufgabe' }, { lang: 'en', value: 'IQB German - Unit' }]
    });
  });

  // in the language of the interface where the profile brings it; by its url where it is not delivered
  it('names the profiles as they name themselves, and asks for their names', () => {
    create({ unit: { assigned: GERMAN_UNIT, unused: [{ profileId: MATH_UNIT }] } });

    expect(fixture.componentInstance.lines()).toEqual({
      assigned: [{ key: 'metadata.assigned-profile', params: { name: 'IQB German - Unit' } }],
      unused: [{ key: 'metadata.unused-unit-profile', params: { name: MATH_UNIT } }],
      unusedCount: { count: '1' }
    });
    expect(request).toHaveBeenCalledWith([GERMAN_UNIT, MATH_UNIT]);
    expect(fixture.nativeElement.querySelectorAll('[data-cy="metadata-profiles-unused"]')).toHaveLength(1);
  });

  // in the unit check, where the profiles of the unit and the items stand together
  it('says whose the assigned profiles are where asked to, and where there is none', () => {
    create({
      unit: { assigned: undefined, unused: [] },
      items: { assigned: undefined, unused: [{ profileId: MATH_ITEM, items: 1 }] },
      withTarget: true
    });

    expect(fixture.componentInstance.lines()).toEqual({
      assigned: [{ key: 'metadata.no-unit-profile' }, { key: 'metadata.no-item-profile' }],
      unused: [{ key: 'metadata.unused-item-profile-one', params: { name: MATH_ITEM, count: '1' } }],
      unusedCount: { count: '1' }
    });
    expect(fixture.nativeElement.querySelector('[data-cy="metadata-profiles-unused-title"]')).toBeTruthy();
  });

  // above the forms of the metadata tab, which a long list would push down: listed only on request
  it('lists the unused profiles only on request where asked to', () => {
    create({
      unit: { assigned: GERMAN_UNIT, unused: [{ profileId: MATH_UNIT }, { profileId: MATH_ITEM }] },
      collapsible: true
    });
    const element = fixture.nativeElement as HTMLElement;
    const toggle = () => element.querySelector('[data-cy="metadata-profiles-unused-toggle"]') as HTMLButtonElement;

    expect(toggle().getAttribute('aria-expanded')).toBe('false');
    expect(fixture.componentInstance.lines().unusedCount).toEqual({ count: '2' });
    expect(element.querySelector('[data-cy="metadata-profiles-unused-title"]')).toBeNull();
    expect(element.querySelector('[data-cy="metadata-profiles-unused-hint"]')).toBeNull();
    expect(element.querySelectorAll('[data-cy="metadata-profiles-unused"]')).toHaveLength(0);

    toggle().click();
    fixture.detectChanges();
    expect(toggle().getAttribute('aria-expanded')).toBe('true');
    expect(element.querySelector('[data-cy="metadata-profiles-unused-hint"]')).toBeTruthy();
    expect(element.querySelectorAll('[data-cy="metadata-profiles-unused"]')).toHaveLength(2);

    toggle().click();
    fixture.detectChanges();
    expect(element.querySelectorAll('[data-cy="metadata-profiles-unused"]')).toHaveLength(0);
  });

  // every edit of the metadata hands in new values; a profile not delivered is not asked for with each
  it('asks for the names again only when other profiles are shown', () => {
    create({ unit: { assigned: GERMAN_UNIT, unused: [] } });

    fixture.componentRef.setInput('unit', { assigned: GERMAN_UNIT, unused: [] });
    fixture.detectChanges();
    expect(request).toHaveBeenCalledTimes(1);

    fixture.componentRef.setInput('unit', { assigned: GERMAN_UNIT, unused: [{ profileId: MATH_UNIT }] });
    fixture.detectChanges();
    expect(request).toHaveBeenLastCalledWith([GERMAN_UNIT, MATH_UNIT]);
    expect(request).toHaveBeenCalledTimes(2);
  });

  it('names a profile by its url where its label has no text', () => {
    labels.set({ [MATH_UNIT]: [{ lang: 'de', value: '' }] });
    create({ unit: { assigned: MATH_UNIT, unused: [] } });

    expect(fixture.componentInstance.lines().assigned)
      .toEqual([{ key: 'metadata.assigned-profile', params: { name: MATH_UNIT } }]);
  });

  it('counts the items of an item profile', () => {
    create({ items: { assigned: undefined, unused: [{ profileId: MATH_ITEM, items: 3 }] } });

    expect(fixture.componentInstance.lines().unused)
      .toEqual([{ key: 'metadata.unused-item-profile', params: { name: MATH_ITEM, count: '3' } }]);
  });

  it('shows no title of unused profiles where there are none', () => {
    create({ unit: { assigned: GERMAN_UNIT, unused: [] } });

    expect(fixture.nativeElement.querySelector('[data-cy="metadata-profiles-unused-title"]')).toBeNull();
  });
});
