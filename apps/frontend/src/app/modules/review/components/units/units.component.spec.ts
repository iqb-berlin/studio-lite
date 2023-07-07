import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpClientModule } from '@angular/common/http';
import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { UnitsComponent } from './units.component';
import { PageData } from '../../../workspace/models/page-data.interface';

describe('UnitsComponent', () => {
  let component: UnitsComponent;
  let fixture: ComponentFixture<UnitsComponent>;

  @Component({ selector: 'studio-lite-page-navigation', template: '' })
  class MockPageNavigationComponent {
    @Input() pageList!: PageData[];
    @Output() gotoPage = new EventEmitter<{ action: string, index?: number }>();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        UnitsComponent,
        MockPageNavigationComponent
      ],
      imports: [
        RouterTestingModule,
        MatSnackBarModule,
        HttpClientModule
      ],
      providers: [{
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
