import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { UnitPlayerComponent } from './unit-player.component';
import { PageData } from '../../../workspace/models/page-data.interface';

describe('UnitPlayerComponent', () => {
  let component: UnitPlayerComponent;
  let fixture: ComponentFixture<UnitPlayerComponent>;

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

    fixture = TestBed.createComponent(UnitPlayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
