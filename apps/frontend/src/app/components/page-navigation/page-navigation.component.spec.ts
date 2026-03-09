import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { By } from '@angular/platform-browser';
import { PageNavigationComponent } from './page-navigation.component';
import { WrappedIconComponent } from '../wrapped-icon/wrapped-icon.component';

describe('PageNavigationComponent', () => {
  let component: PageNavigationComponent;
  let fixture: ComponentFixture<PageNavigationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        PageNavigationComponent,
        WrappedIconComponent
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PageNavigationComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    component.pageList = [];
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('Template rendering', () => {
    it('should not render navigation when pageList is empty', () => {
      component.pageList = [];
      fixture.detectChanges();

      const navContainer = fixture.debugElement.query(By.css('.page-nav'));
      expect(navContainer).toBeNull();
    });

    it('should render navigation when pageList has items', () => {
      component.pageList = [
        {
          index: 1, id: 'page1', type: '#goto', disabled: false
        }
      ];
      fixture.detectChanges();

      const navContainer = fixture.debugElement.query(By.css('.page-nav'));
      expect(navContainer).toBeTruthy();
    });

    it('should render previous button for #previous type', () => {
      component.pageList = [
        {
          index: 0, id: 'prev', type: '#previous', disabled: false
        }
      ];
      fixture.detectChanges();

      const prevButton = fixture.debugElement.query(By.css('.previous-button'));
      expect(prevButton).toBeTruthy();
      expect(prevButton.nativeElement.disabled).toBe(false);
    });

    it('should render next button for #next type', () => {
      component.pageList = [
        {
          index: 0, id: 'next', type: '#next', disabled: false
        }
      ];
      fixture.detectChanges();

      const nextButton = fixture.debugElement.query(By.css('.next-button'));
      expect(nextButton).toBeTruthy();
      expect(nextButton.nativeElement.disabled).toBe(false);
    });

    it('should render page button for #goto type', () => {
      component.pageList = [
        {
          index: 1, id: 'page1', type: '#goto', disabled: false
        }
      ];
      fixture.detectChanges();

      const pageButton = fixture.debugElement.query(By.css('.page-button'));
      expect(pageButton).toBeTruthy();
      expect(pageButton.nativeElement.textContent.trim()).toBe('1');
    });

    it('should disable previous button when disabled is true', () => {
      component.pageList = [
        {
          index: 0, id: 'prev', type: '#previous', disabled: true
        }
      ];
      fixture.detectChanges();

      const prevButton = fixture.debugElement.query(By.css('.previous-button'));
      expect(prevButton.nativeElement.disabled).toBe(true);
    });

    it('should disable next button when disabled is true', () => {
      component.pageList = [
        {
          index: 0, id: 'next', type: '#next', disabled: true
        }
      ];
      fixture.detectChanges();

      const nextButton = fixture.debugElement.query(By.css('.next-button'));
      expect(nextButton.nativeElement.disabled).toBe(true);
    });

    it('should add selected-page class to disabled goto button', () => {
      component.pageList = [
        {
          index: 1, id: 'page1', type: '#goto', disabled: true
        }
      ];
      fixture.detectChanges();

      const pageButton = fixture.debugElement.query(By.css('.page-button'));
      expect(pageButton.nativeElement.classList.contains('selected-page')).toBe(true);
      expect(pageButton.nativeElement.disabled).toBe(true);
    });

    it('should render multiple page buttons', () => {
      component.pageList = [
        {
          index: 0, id: 'prev', type: '#previous', disabled: false
        },
        {
          index: 1, id: 'page1', type: '#goto', disabled: false
        },
        {
          index: 2, id: 'page2', type: '#goto', disabled: true
        },
        {
          index: 3, id: 'page3', type: '#goto', disabled: false
        },
        {
          index: 0, id: 'next', type: '#next', disabled: false
        }
      ];
      fixture.detectChanges();

      const pageButtons = fixture.debugElement.queryAll(By.css('.page-button'));
      expect(pageButtons.length).toBe(3);
    });

    it('should show enabled indicator for non-disabled goto pages', () => {
      component.pageList = [
        {
          index: 1, id: 'page1', type: '#goto', disabled: false
        }
      ];
      fixture.detectChanges();

      const enabledIndicators = fixture.debugElement.queryAll(By.css('.page-nav-enabled'));
      expect(enabledIndicators.length).toBe(2); // Top and bottom indicators
    });

    it('should show disabled indicator for disabled goto pages', () => {
      component.pageList = [
        {
          index: 1, id: 'page1', type: '#goto', disabled: true
        }
      ];
      fixture.detectChanges();

      const disabledIndicators = fixture.debugElement.queryAll(By.css('.page-nav-disabled'));
      expect(disabledIndicators.length).toBe(2); // Top and bottom indicators
    });
  });

  describe('Event emission', () => {
    it('should emit gotoPage event when previous button is clicked', () => {
      jest.spyOn(component.gotoPage, 'emit');
      component.pageList = [
        {
          index: 0, id: 'prev', type: '#previous', disabled: false
        }
      ];
      fixture.detectChanges();

      const prevButton = fixture.debugElement.query(By.css('.previous-button'));
      prevButton.nativeElement.click();

      expect(component.gotoPage.emit).toHaveBeenCalledWith({ action: '#previous' });
    });

    it('should emit gotoPage event when next button is clicked', () => {
      jest.spyOn(component.gotoPage, 'emit');
      component.pageList = [
        {
          index: 0, id: 'next', type: '#next', disabled: false
        }
      ];
      fixture.detectChanges();

      const nextButton = fixture.debugElement.query(By.css('.next-button'));
      nextButton.nativeElement.click();

      expect(component.gotoPage.emit).toHaveBeenCalledWith({ action: '#next' });
    });

    it('should emit gotoPage event with index when page button is clicked', () => {
      jest.spyOn(component.gotoPage, 'emit');
      component.pageList = [
        {
          index: 3, id: 'page3', type: '#goto', disabled: false
        }
      ];
      fixture.detectChanges();

      const pageButton = fixture.debugElement.query(By.css('.page-button'));
      pageButton.nativeElement.click();

      expect(component.gotoPage.emit).toHaveBeenCalledWith({ action: '#goto', index: 3 });
    });

    it('should not emit event when disabled button is clicked', () => {
      jest.spyOn(component.gotoPage, 'emit');
      component.pageList = [
        {
          index: 0, id: 'prev', type: '#previous', disabled: true
        }
      ];
      fixture.detectChanges();

      const prevButton = fixture.debugElement.query(By.css('.previous-button'));
      prevButton.nativeElement.click();

      expect(component.gotoPage.emit).not.toHaveBeenCalled();
    });
  });

  describe('Integration scenarios', () => {
    it('should render complete navigation with all button types', () => {
      component.pageList = [
        {
          index: 0, id: 'prev', type: '#previous', disabled: true
        },
        {
          index: 1, id: 'page1', type: '#goto', disabled: true
        },
        {
          index: 2, id: 'page2', type: '#goto', disabled: false
        },
        {
          index: 3, id: 'page3', type: '#goto', disabled: false
        },
        {
          index: 0, id: 'next', type: '#next', disabled: false
        }
      ];
      fixture.detectChanges();

      const prevButton = fixture.debugElement.query(By.css('.previous-button'));
      const nextButton = fixture.debugElement.query(By.css('.next-button'));
      const pageButtons = fixture.debugElement.queryAll(By.css('.page-button'));

      expect(prevButton).toBeTruthy();
      expect(nextButton).toBeTruthy();
      expect(pageButtons.length).toBe(3);
      expect(prevButton.nativeElement.disabled).toBe(true);
      expect(nextButton.nativeElement.disabled).toBe(false);
    });
  });
});
