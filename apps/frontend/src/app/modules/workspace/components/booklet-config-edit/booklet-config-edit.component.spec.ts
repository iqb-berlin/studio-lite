import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  TranslateFakeLoader,
  TranslateLoader,
  TranslateModule
} from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { BookletConfigDto } from '@studio-lite-lib/api-dto';
import { BookletConfigEditComponent } from './booklet-config-edit.component';

describe('BookletConfigEditComponent', () => {
  let component: BookletConfigEditComponent;
  let fixture: ComponentFixture<BookletConfigEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        FormsModule,
        MatSelectModule,
        MatCheckboxModule,
        MatIconModule,
        MatSlideToggleModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        }),
        BookletConfigEditComponent
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BookletConfigEditComponent);
    component = fixture.componentInstance;
    component.config = undefined;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('defaults config values when undefined', () => {
    expect(component.bookletConfig).toEqual({});
  });

  it('accepts a provided config object', () => {
    const config: BookletConfigDto = {
      pagingMode: 'buttons',
      pageNaviButtons: 'OFF',
      unitNaviButtons: 'FULL',
      controllerDesign: '2022',
      unitScreenHeader: 'WITH_UNIT_TITLE',
      unitTitle: 'ON'
    };

    component.config = config;

    expect(component.bookletConfig).toEqual(config);
  });

  it('should default context to review', () => {
    expect(component.context).toBe('review');
  });

  describe('context=review', () => {
    beforeEach(() => {
      component.context = 'review';
      fixture.detectChanges();
    });

    it('should render controllerDesign field', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelectorAll('mat-select').length).toBeGreaterThanOrEqual(6);
    });

    it('should not render new modern fields', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const selects = compiled.querySelectorAll('mat-select');
      expect(selects.length).toBe(6);
    });
  });

  describe('context=export', () => {
    beforeEach(() => {
      component.context = 'export';
      fixture.detectChanges();
    });

    it('should not render controllerDesign field', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const selects = compiled.querySelectorAll('mat-select');
      expect(selects.length).toBeGreaterThan(6);
    });

    it('should render new modern fields', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const selects = compiled.querySelectorAll('mat-select');
      expect(selects.length).toBe(22);
    });
  });
});
