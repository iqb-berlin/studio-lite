import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { BookletConfigShowComponent } from './booklet-config-show.component';

describe('BookletConfigShowComponent', () => {
  let component: BookletConfigShowComponent;
  let fixture: ComponentFixture<BookletConfigShowComponent>;

  const bookletConfigDefault = {
    pagingMode: '',
    pageNaviButtons: '',
    unitNaviButtons: '',
    controllerDesign: '',
    unitScreenHeader: '',
    unitTitle: ''
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        BookletConfigShowComponent,
        TranslateModule.forRoot()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BookletConfigShowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('config Input Setter', () => {
    it('should use default config when undefined is provided', () => {
      component.config = undefined;

      expect(component.bookletConfig).toEqual(bookletConfigDefault);
    });
  });

  describe('settings the review applies (#1803)', () => {
    const rowText = (key: string): string => {
      const row = (fixture.nativeElement as HTMLElement)
        .querySelector(`[data-cy="booklet-config-show-${key}"]`);
      return row?.textContent?.replace(/\s+/g, ' ').trim() || '';
    };

    it('should list the value the review applies for every setting left empty', () => {
      component.config = undefined;

      expect(component.settings).toEqual([
        { key: 'pagingMode', value: 'separate', isDefault: true },
        { key: 'pageNaviButtons', value: 'SEPARATE_BOTTOM', isDefault: true },
        { key: 'unitNaviButtons', value: 'FULL', isDefault: true },
        { key: 'controllerDesign', value: '2022', isDefault: true },
        { key: 'unitScreenHeader', value: 'EMPTY', isDefault: true },
        { key: 'unitTitle', value: 'OFF', isDefault: true }
      ]);
    });

    it('should list a value that is set as it is, without the default mark', () => {
      component.config = { unitTitle: 'ON', pageNaviButtons: 'OFF' };

      expect(component.settings.find(s => s.key === 'unitTitle'))
        .toEqual({ key: 'unitTitle', value: 'ON', isDefault: false });
      expect(component.settings.find(s => s.key === 'pageNaviButtons'))
        .toEqual({ key: 'pageNaviButtons', value: 'OFF', isDefault: false });
      expect(component.settings.find(s => s.key === 'unitScreenHeader'))
        .toEqual({ key: 'unitScreenHeader', value: 'EMPTY', isDefault: true });
    });

    it('should show all six settings, an empty one with its default and the mark', () => {
      component.config = { controllerDesign: '2018' };
      fixture.detectChanges();

      expect((fixture.nativeElement as HTMLElement).querySelectorAll('[data-cy^="booklet-config-show-"]'))
        .toHaveLength(6);
      expect(rowText('unitTitle'))
        .toBe('booklet-config.unitTitle.label booklet-config.unitTitle.OFF booklet-config.is-default');
      expect(rowText('controllerDesign'))
        .toBe('booklet-config.controllerDesign.label booklet-config.controllerDesign.2018');
    });
  });
});
