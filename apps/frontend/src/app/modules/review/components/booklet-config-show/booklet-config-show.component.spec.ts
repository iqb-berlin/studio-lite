import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { BookletConfigDto } from '@studio-lite-lib/api-dto';
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

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Initialization', () => {
    it('should initialize with default bookletConfig', () => {
      expect(component.bookletConfig).toEqual(bookletConfigDefault);
    });
  });

  describe('config Input Setter', () => {
    it('should set bookletConfig when valid config is provided', () => {
      const testConfig: BookletConfigDto = {
        pagingMode: 'separate',
        pageNaviButtons: 'FIRST_PREV_NEXT_LAST_SEPARATE_ONLY',
        unitNaviButtons: 'ARROWS_ONLY',
        controllerDesign: 'controls-over-content',
        unitScreenHeader: 'WITH_UNIT_TITLE',
        unitTitle: 'Test Title'
      };

      component.config = testConfig;

      expect(component.bookletConfig).toEqual(testConfig);
    });

    it('should use default config when undefined is provided', () => {
      component.config = undefined;

      expect(component.bookletConfig).toEqual(bookletConfigDefault);
    });

    it('should replace existing config with new config', () => {
      const firstConfig: BookletConfigDto = {
        pagingMode: 'concat-scroll',
        pageNaviButtons: 'FIRST_LAST_ONLY',
        unitNaviButtons: '',
        controllerDesign: '',
        unitScreenHeader: '',
        unitTitle: 'First Title'
      };

      const secondConfig: BookletConfigDto = {
        pagingMode: 'separate',
        pageNaviButtons: 'ARROWS_ONLY',
        unitNaviButtons: 'ARROWS_ONLY',
        controllerDesign: 'controls-over-content',
        unitScreenHeader: 'WITH_UNIT_TITLE',
        unitTitle: 'Second Title'
      };

      component.config = firstConfig;
      expect(component.bookletConfig).toEqual(firstConfig);

      component.config = secondConfig;
      expect(component.bookletConfig).toEqual(secondConfig);
    });

    it('should handle partial config object', () => {
      const partialConfig: BookletConfigDto = {
        pagingMode: 'separate'
      };

      component.config = partialConfig;

      expect(component.bookletConfig).toEqual(partialConfig);
      expect(component.bookletConfig.pagingMode).toBe('separate');
    });

    it('should handle empty config object', () => {
      const emptyConfig: BookletConfigDto = {};

      component.config = emptyConfig;

      expect(component.bookletConfig).toEqual(emptyConfig);
    });
  });

  describe('Template Binding', () => {
    it('should have bookletConfig accessible for template', () => {
      component.config = {
        pagingMode: 'separate',
        unitTitle: 'Test'
      };
      fixture.detectChanges();

      expect(component.bookletConfig.pagingMode).toBe('separate');
      expect(component.bookletConfig.unitTitle).toBe('Test');
    });
  });
});
