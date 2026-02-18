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
    expect(component.bookletConfig).toEqual({
      pagingMode: '',
      pageNaviButtons: '',
      unitNaviButtons: '',
      controllerDesign: '',
      unitScreenHeader: '',
      unitTitle: ''
    });
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
});
