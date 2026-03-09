import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MetadataValues } from '@studio-lite-lib/api-dto';
import { MetadataProfileEntriesComponent } from './metadata-profile-entries.component';
import { IsArrayPipe } from '../../../../pipes/isArray.pipe';
import { CastPipe } from '../../../../pipes/cast.pipe';

describe('MetadataProfileEntriesComponent', () => {
  let component: MetadataProfileEntriesComponent;
  let fixture: ComponentFixture<MetadataProfileEntriesComponent>;

  const mockProfiles: MetadataValues[] = [
    {
      profileId: 'profile1',
      isCurrent: true,
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
        }
      ]
    },
    {
      profileId: 'profile2',
      isCurrent: false,
      entries: [
        {
          id: 'entry5',
          label: [{ lang: 'de', value: 'Eintrag 5' }],
          value: 'Nicht sichtbar',
          valueAsText: { lang: 'de', value: 'Nicht sichtbar' }
        }
      ]
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MetadataProfileEntriesComponent,
        IsArrayPipe,
        CastPipe
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MetadataProfileEntriesComponent);
    component = fixture.componentInstance;
    component.profiles = mockProfiles;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render entries only for the current profile', () => {
    const profilesElements = fixture.nativeElement.querySelectorAll('.profiles');
    expect(profilesElements.length).toBe(2);

    const visibleEntries = fixture.nativeElement
      .querySelectorAll('.fx-row-space-between-start');
    expect(visibleEntries.length).toBe(4); // entry1, entry2, entry3, entry4
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

  it('should render "-" for empty value array', () => {
    const entry4 = fixture.nativeElement
      .querySelectorAll('.fx-row-space-between-start')[3];
    expect(entry4.querySelector('.item-key').textContent).toContain('Eintrag 4');
    expect(entry4.querySelector('span:not(.item-key)').textContent).toBe('-');
  });
});
