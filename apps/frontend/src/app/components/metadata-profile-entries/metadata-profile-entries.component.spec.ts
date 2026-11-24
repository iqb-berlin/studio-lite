import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ProfileValues } from '@studio-lite-lib/api-dto';
import { MetadataProfileEntriesComponent } from './metadata-profile-entries.component';
import { LanguageService } from '../../services/language.service';

describe('MetadataProfileEntriesComponent', () => {
  let component: MetadataProfileEntriesComponent;
  let fixture: ComponentFixture<MetadataProfileEntriesComponent>;

  const mockProfiles: ProfileValues[] = [
    {
      profileId: 'profile1',
      order: 0,
      entries: [
        {
          id: 'entry1',
          label: [{ lang: 'de', value: 'Eintrag 1' }],
          value: 'Wert 1',
          valueAsText: { lang: 'de', value: 'Wert 1' }
        },
        {
          id: 'entry2',
          label: [{ lang: 'de', value: 'Eintrag 2' }],
          value: [],
          valueAsText: [
            { lang: 'de', value: 'Wert 2a' },
            { lang: 'de', value: 'Wert 2b' }
          ]
        },
        {
          id: 'entry3',
          label: [{ lang: 'de', value: 'Eintrag 3' }],
          value: [],
          valueAsText: [{ lang: 'de', value: 'Einzelner Wert in Liste' }]
        },
        {
          id: 'entry4',
          label: [{ lang: 'de', value: 'Eintrag 4' }],
          value: [],
          valueAsText: []
        },
        {
          id: 'entry5',
          label: [{ lang: 'de', value: 'Eintrag 5' }],
          value: [{ lang: 'de', value: '' }],
          valueAsText: [{ lang: 'de', value: '' }]
        }
      ]
    },
    {
      profileId: 'profile2',
      order: -1,
      entries: [
        {
          id: 'entry6',
          label: [{ lang: 'de', value: 'Eintrag 6' }],
          value: 'Nicht sichtbar',
          valueAsText: { lang: 'de', value: 'Nicht sichtbar' }
        }
      ]
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MetadataProfileEntriesComponent, TranslateModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MetadataProfileEntriesComponent);
    component = fixture.componentInstance;
    component.profiles = mockProfiles;
    fixture.detectChanges();
  });

  it('should render entries only for the current profile', () => {
    const profilesElements = fixture.nativeElement.querySelectorAll('.profiles');
    expect(profilesElements.length).toBe(2);

    const visibleEntries = fixture.nativeElement
      .querySelectorAll('.fx-row-space-between-start');
    expect(visibleEntries.length).toBe(3); // entry1, entry2, entry3
  });

  it('should render single value correctly', () => {
    const entry1 = fixture.nativeElement
      .querySelectorAll('.fx-row-space-between-start')[0];
    expect(entry1.querySelector('.item-key').textContent).toContain('Eintrag 1');
    expect(entry1.querySelector('.item-value').textContent).toContain('Wert 1');
  });

  it('should render list of values correctly', () => {
    const entry2 = fixture.nativeElement
      .querySelectorAll('.fx-row-space-between-start')[1];
    expect(entry2.querySelector('.item-key').textContent).toContain('Eintrag 2');
    const listItems = entry2.querySelectorAll('li.item-list-value');
    expect(listItems.length).toBe(2);
    expect(listItems[0].textContent).toContain('Wert 2a');
    expect(listItems[1].textContent).toContain('Wert 2b');
  });

  it('should render single value in array as span', () => {
    const entry3 = fixture.nativeElement
      .querySelectorAll('.fx-row-space-between-start')[2];
    expect(entry3.querySelector('.item-key').textContent).toContain('Eintrag 3');
    expect(entry3.querySelector('.item-value').textContent)
      .toContain('Einzelner Wert in Liste');
    expect(entry3.querySelector('ul')).toBeNull();
  });

  it('should not render entries without displayable value', () => {
    const keys = Array.from(
      fixture.nativeElement.querySelectorAll('.item-key')
    ).map(element => (element as HTMLElement).textContent?.trim());
    expect(keys).not.toContain('Eintrag 4');
    expect(keys).not.toContain('Eintrag 5');
  });

  // A profile and vocabulary that bring English read in English in the English interface (#2207).
  it('should show field names and terms in the language of the interface', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [MetadataProfileEntriesComponent, TranslateModule.forRoot()],
      providers: [{ provide: LanguageService, useValue: { active: { code: 'en' } } }]
    });
    TestBed.inject(TranslateService).use('en');
    const englishFixture = TestBed.createComponent(MetadataProfileEntriesComponent);
    englishFixture.componentInstance.profiles = [{
      profileId: 'p80',
      order: 0,
      entries: [{
        id: 'data',
        label: [{ lang: 'de', value: 'Art der Daten' }, { lang: 'en', value: 'Type of data' }],
        value: [{ id: 'dt/1' }, { id: 'dt/3' }],
        valueAsText: [
          { lang: 'de', value: 'Kompetenzdaten' }, { lang: 'en', value: 'Skills data' },
          { lang: 'de', value: 'Umfragedaten' }, { lang: 'en', value: 'Survey data' }
        ]
      }]
    }];
    englishFixture.detectChanges();

    const element: HTMLElement = englishFixture.nativeElement;
    expect(element.querySelector('.item-key')?.textContent?.trim()).toBe('Type of data');
    expect(Array.from(element.querySelectorAll('li.item-list-value')).map(item => item.textContent?.trim()))
      .toEqual(['Skills data', 'Survey data']);
  });
});
