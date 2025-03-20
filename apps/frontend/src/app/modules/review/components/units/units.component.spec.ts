import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { UnitsComponent } from './units.component';
import { PageData } from '../../../workspace/models/page-data.interface';

describe('UnitsComponent', () => {
  let component: UnitsComponent;
  let fixture: ComponentFixture<UnitsComponent>;

  @Component({ selector: 'studio-lite-page-navigation', template: '', standalone: false })
  class MockPageNavigationComponent {
    @Input() pageList!: PageData[];
    @Output() gotoPage = new EventEmitter<{ action: string, index?: number }>();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MockPageNavigationComponent
      ],
      imports: [
        TranslateModule.forRoot(),
        MatSnackBarModule
      ],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        {
          provide: 'SERVER_URL',
          useValue: environment.backendUrl
        }]
    }).compileComponents();

    fixture = TestBed.createComponent(UnitsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
